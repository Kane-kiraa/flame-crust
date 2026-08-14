import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { create, update } from "@/lib/api";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { BakongKHQR, MerchantInfo } from "bakong-khqr";

export default function PaymentGatewayPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [qrCodeString, setQrCodeString] = useState("");

  const { total = 0, paymentMethod = "ABA_PAY" } = location.state || {};

  useEffect(() => {
    if (!orderId || !total) {
      navigate("/");
      return;
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

    // Generate KHQR
    try {
      const accountId = import.meta.env.VITE_BAKONG_ACCOUNT_ID || "kanekira@acleda";
      const merchantName = import.meta.env.VITE_BAKONG_MERCHANT_NAME || "Flame Crust";
      const qrInfo = new MerchantInfo(
        accountId,
        merchantName,
        "Phnom Penh",
        Number(total),
        "USD",
        "STORE1",
        "TERM1"
      );
      const khqr = new BakongKHQR();
      const res = khqr.generateMerchant(qrInfo);
      if (res && res.data && res.data.qr) {
        setQrCodeString(res.data.qr);
      }
    } catch (e) {
      console.error("Failed to generate KHQR", e);
    }

    return () => clearInterval(timer);
  }, [orderId, total, navigate]);

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      // Create payment record
      await create("payments", {
        order_id: orderId,
        payment_method: paymentMethod,
        payment_status: "PAID",
        amount: total
      });

      // Update order status
      await update("orders", orderId, { status: "CONFIRMED" });

      toast.success("Payment successful!");
      
      // Redirect to confirmation with state
      navigate("/order-confirmation", {
        state: location.state
      });

    } catch (err) {
      toast.error("Payment simulation failed.");
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
          <h1 className="font-serif text-2xl font-bold">Secure Checkout</h1>
          <p className="text-primary-foreground/80 mt-1">{paymentMethod.replace("_", " ")}</p>
        </div>

        <div className="p-8 flex flex-col items-center">
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm">Amount to pay</p>
            <p className="text-4xl font-bold text-foreground mt-1">${total.toFixed(2)}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 relative group overflow-hidden">
            {qrCodeString ? (
              <QRCodeCanvas value={qrCodeString} size={192} includeMargin={false} />
            ) : (
              <QrCode className="size-48 text-zinc-900" />
            )}
            
            {/* Scanning animation overlay */}
            <motion.div 
              className="absolute top-4 left-4 h-1 bg-primary shadow-[0_0_8px_rgba(239,68,68,0.8)] rounded-full z-10"
              style={{ width: "192px" }}
              animate={{ y: [0, 192, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </div>

          <div className="flex items-center gap-2 text-muted-foreground mb-8">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm font-medium">Waiting for payment... ({formatTime(timeLeft)})</span>
          </div>

          <Button 
            onClick={handleSimulatePayment} 
            disabled={loading || timeLeft === 0}
            className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-warm"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="size-5 mr-2" />
            )}
            Simulate Success
          </Button>
          
          <button 
            onClick={() => navigate(`/track/${orderId}`)}
            className="mt-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel Payment
          </button>
        </div>
      </motion.div>
    </div>
  );
}
