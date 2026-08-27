import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, CheckCircle2, ShieldCheck, Loader2, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { get, create, update, API_URL } from "@/lib/api";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { BakongKHQR, IndividualInfo } from "bakong-khqr";

export default function PaymentGatewayPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [qrCodeString, setQrCodeString] = useState("");
  const [totalAmount, setTotalAmount] = useState(location.state?.total || 0);
  const paymentMethod = location.state?.paymentMethod || "KHQR";

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const loadOrderData = async () => {
      if (!totalAmount) {
        try {
          const ord = await get("orders", orderId);
          if (ord && ord.total) {
            setTotalAmount(Number(ord.total));
          }
        } catch (e) {
          console.error("Failed to fetch order:", e);
        }
      }
    };
    loadOrderData();
  }, [orderId]);

  const generateQR = (amountToUse = totalAmount) => {
    try {
      const accountId = import.meta.env.VITE_BAKONG_ACCOUNT_ID || "khemara_chantha1@bkrt";
      const merchantName = import.meta.env.VITE_BAKONG_MERCHANT_NAME || "Flame Crust";
      const qrInfo = new IndividualInfo(
        accountId,
        merchantName,
        "Phnom Penh",
        {
          currency: "840", // USD
          amount: Number(Number(amountToUse || 0).toFixed(2)),
          storeLabel: "FlameCrust",
          terminalLabel: "T1"
        }
      );
      const khqr = new BakongKHQR();
      const res = khqr.generateIndividual(qrInfo);
      if (res && res.data && res.data.qr) {
        setQrCodeString(res.data.qr);
        console.log("Generated KHQR String:", res.data.qr);
      } else {
        throw new Error(res?.status?.message || "Invalid QR response");
      }
    } catch (e) {
      console.error("Failed to generate KHQR", e);
      // Fallback KHQR simulation string
      setQrCodeString(`https://bakong.nbc.gov.kh/pay?account=khemara_chantha1@bkrt&amount=${Number(amountToUse || 0).toFixed(2)}&currency=USD`);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    if (totalAmount > 0 && (paymentMethod === "KHQR" || paymentMethod === "ABA_PAY")) {
      generateQR(totalAmount);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Payment session expired.");
          navigate(`/track/${orderId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, totalAmount, navigate, paymentMethod]);

  useEffect(() => {
    if (paymentMethod === "CARD") {
      // Auto-confirm CARD after 4 seconds
      const autoConfirmTimer = setTimeout(() => {
        handleSimulatePayment();
      }, 4000);
      return () => clearTimeout(autoConfirmTimer);
    }
  }, [paymentMethod, totalAmount]);

  const checkPaymentVerification = async () => {
    if (!orderId) return;
    setIsVerifying(true);
    try {
      const response = await fetch(`${API_URL}/payments/verify-khqr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qr_code_string: qrCodeString || "dummy",
          qrCodeString: qrCodeString || "dummy",
          order_id: orderId,
          orderId
        })
      });
      const data = await response.json();

      const confirmationState = {
        orderId,
        total: Number(totalAmount),
        itemCount: location.state?.itemCount || 1,
        paymentMethod,
        address: location.state?.address || "Phnom Penh",
      };

      if (data.status === "SUCCESS") {
        setIsPaid(true);
        toast.success("Payment verified successfully!");
        setTimeout(() => {
          navigate("/order-confirmation", { state: confirmationState });
        }, 1500);
        return true;
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
    return false;
  };

  // Poll Backend for KHQR Status every 3.5 seconds
  useEffect(() => {
    if (paymentMethod !== "KHQR" && paymentMethod !== "ABA_PAY") return;

    const pollTimer = setInterval(async () => {
      const verified = await checkPaymentVerification();
      if (verified) {
        clearInterval(pollTimer);
      }
    }, 3500);

    return () => clearInterval(pollTimer);
  }, [qrCodeString, orderId, paymentMethod, totalAmount]);

  const handleSimulatePayment = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const dbMethod = ["CASH", "CARD", "ABA_PAY", "WING"].includes(paymentMethod) ? paymentMethod : "KHQR";
      
      // Create payment record
      await create("payments", {
        order_id: orderId,
        method: dbMethod,
        status: "PAID",
        amount: Number(Number(totalAmount).toFixed(2))
      });

      // Update order status
      await update("orders", orderId, { status: "CONFIRMED" });

      setIsPaid(true);
      toast.success("Payment confirmed!");

      setTimeout(() => {
        navigate("/order-confirmation", {
          state: {
            orderId,
            total: Number(totalAmount),
            itemCount: location.state?.itemCount || 1,
            paymentMethod,
            address: location.state?.address || "Phnom Penh",
          }
        });
      }, 1200);

    } catch (err) {
      toast.error("Payment confirmation failed.");
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/60"
      >
        <div className="bg-primary p-6 text-center text-primary-foreground relative">
          <ShieldCheck className="size-8 absolute top-6 left-6 opacity-50" />
          <button 
            onClick={() => navigate(`/track/${orderId}`)} 
            className="absolute top-6 right-6 opacity-70 hover:opacity-100 transition-opacity bg-primary-foreground/10 rounded-full p-1"
            title="Pay Later / Cancel"
          >
            <X className="size-6" />
          </button>
          <h1 className="font-serif text-2xl font-bold">Secure Checkout</h1>
          <p className="text-primary-foreground/80 mt-1">{paymentMethod.replace("_", " ")}</p>
        </div>

        <div className="p-6 sm:p-8 flex flex-col items-center">
          {isPaid ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 flex flex-col items-center text-center space-y-4"
            >
              <div className="size-20 rounded-full bg-green-500/15 text-green-500 flex items-center justify-center">
                <CheckCircle2 className="size-12" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Payment Received!</h2>
              <p className="text-sm text-muted-foreground">Redirecting to order confirmation...</p>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-muted-foreground text-sm">Amount to pay</p>
                <p className="text-4xl font-bold text-foreground mt-1">${Number(totalAmount).toFixed(2)}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 relative group overflow-hidden">
                {paymentMethod === "CARD" ? (
                  <div className="size-48 flex items-center justify-center bg-blue-50/50 rounded-xl border-2 border-blue-100">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <CreditCard className="size-24 text-blue-500" />
                    </motion.div>
                  </div>
                ) : qrCodeString ? (
                  <div className="p-4 bg-white rounded-2xl shadow-md">
                    <QRCodeCanvas
                      value={qrCodeString}
                      size={192}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                ) : (
                  <div className="size-48 flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl bg-muted/30">
                    <QrCode className="size-12 text-muted-foreground mb-3 opacity-50" />
                    <Button type="button" size="sm" onClick={generateQR} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Generate KHQR
                    </Button>
                  </div>
                )}

                {/* Scanning animation overlay for QR codes */}
                {paymentMethod !== "CARD" && qrCodeString && (
                  <motion.div
                    className="absolute top-4 left-4 h-1 bg-primary shadow-[0_0_8px_rgba(239,68,68,0.8)] rounded-full z-10"
                    style={{ width: "192px" }}
                    animate={{ y: [0, 192, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                )}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm font-medium">
                  {paymentMethod === "CARD" ? "Processing card payment..." : "Waiting for payment..."} ({formatTime(timeLeft)})
                </span>
              </div>

              {/* Action buttons */}
              <div className="w-full space-y-2.5">
                <Button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={loading || isVerifying}
                  className="w-full h-11 rounded-full bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm shadow-md"
                >
                  {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />}
                  I Have Completed Payment
                </Button>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {qrCodeString && (
                    <button
                      onClick={generateQR}
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground font-medium"
                    >
                      🔄 Refresh QR
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/track/${orderId}`)}
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground font-medium ml-auto"
                  >
                    Pay Later / Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
