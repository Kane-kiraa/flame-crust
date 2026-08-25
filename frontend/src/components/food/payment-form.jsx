import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Landmark, QrCode, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { BakongKHQR, IndividualInfo } from "bakong-khqr";
import ImageUpload from "@/components/ImageUpload";
import { MapPicker } from "./map-picker";
import { LocateFixed, MapPin, Truck, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { list } from "@/lib/api";

const methods = [
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "KHQR", label: "KHQR", icon: QrCode },
  { id: "ABA_PAY", label: "ABA Pay", icon: Wallet },
  { id: "CASH", label: "Cash", icon: Landmark }
];

export function PaymentForm({ total, onBack, onSuccess }) {
  const [method, setMethod] = useState("CARD");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Phnom Penh");
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [qrCodeString, setQrCodeString] = useState("");
  const [paymentSlip, setPaymentSlip] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!qrCodeString) return;
    
    setTimeLeft(300);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setQrCodeString("");
          toast.error("Payment session expired. Please generate a new QR Code.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [qrCodeString]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const stored = localStorage.getItem("customerAuth");
        if (!stored) return;
        const customer = JSON.parse(stored);
        const addresses = await list("addresses");
        const myAddresses = addresses.filter(a => String(a.customer_id) === String(customer.id));
        setSavedAddresses(myAddresses);
        
        // Auto-select default address if user hasn't typed anything
        if (myAddresses.length > 0 && !address) {
          const defaultAddr = myAddresses.find(a => a.is_default) || myAddresses[0];
          setAddress(defaultAddr.address_line);
          setCity(defaultAddr.city);
        }
      } catch (e) {
        console.error("Failed to fetch addresses:", e);
      }
    };
    fetchAddresses();
  }, []);

  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();

        if (data && data.address) {
          const addr = data.address;
          const cityMatch = ["Phnom Penh", "Kandal", "Siem Reap", "Sihanoukville", "Battambang", "Kampong Cham"].find(
            c => addr.city?.includes(c) || addr.state?.includes(c) || addr.province?.includes(c)
          );

          setAddress(data.display_name);
          setCity(cityMatch || "Phnom Penh");
          toast.success("Location found!");
        }
      } catch (err) {
        toast.error("Failed to get location address");
      } finally {
        setIsLocating(false);
      }
    }, () => {
      toast.error("Please allow location permissions");
      setIsLocating(false);
    });
  };


  const generateQR = () => {
    try {
      const accountId = import.meta.env.VITE_BAKONG_ACCOUNT_ID || "khemara_chantha1@bkrt";
      const merchantName = import.meta.env.VITE_BAKONG_MERCHANT_NAME || "Flame Crust";
      const qrInfo = new IndividualInfo(
        accountId,
        merchantName,
        "Phnom Penh",
        {
          currency: "840", // USD for real store pricing
          amount: Number(Number(total).toFixed(2)), // Dynamic calculation from order total
          storeLabel: "FlameCrust",
          terminalLabel: "T1"
        }
      );
      const khqr = new BakongKHQR();
      const res = khqr.generateIndividual(qrInfo);
      if (res && res.data && res.data.qr) {
        setQrCodeString(res.data.qr);
        console.log("Generated KHQR String in payment-form.jsx:", res.data.qr);
        toast.success("QR Code generated");
      } else {
        throw new Error(res?.status?.message || "Invalid QR response");
      }
    } catch (e) {
      console.error("Failed to generate KHQR in form", e);
      toast.error(e.message || "Failed to generate QR");
    }
  };

  // Reset QR if total changes
  useEffect(() => {
    setQrCodeString("");
  }, [total]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPayment = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    
    if (!address) {
      toast.error("Please provide a delivery address or pin on map.");
      return;
    }
    if (method === "CARD" && (!card.name || !card.number || !card.expiry || !card.cvv)) {
      toast.error("Please complete your card details");
      return;
    }
    if (method === "ABA_PAY" && !paymentSlip) {
      toast.error("សូមបញ្ចូលរូបភាពវិក័យប័ត្រទូទាត់ប្រាក់របស់អ្នក (Payment Slip)");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSuccess({
        method,
        cardLast4: method === "CARD" ? card.number.slice(-4) : null,
        paymentSlip: paymentSlip,
        address,
        city
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto bg-background px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-5">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack} aria-label="Back to cart">
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h3 className="font-serif text-xl font-bold text-foreground">Payment</h3>
          <p className="text-xs text-muted-foreground">Choose how you want to pay</p>
        </div>
      </div>

      <form onSubmit={submitPayment} className="space-y-6 pt-6">

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Truck className="size-4 text-primary" /> Delivery Details
            </h4>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowMap(true)} className="h-7 text-[11px] rounded-full px-3">
                <MapPin className="size-3 mr-1.5" />
                Map
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleAutoLocation} disabled={isLocating} className="h-7 text-[11px] rounded-full px-3">
                <LocateFixed className={`size-3 mr-1.5 ${isLocating ? "animate-spin" : ""}`} />
                Auto
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {savedAddresses.length > 0 && (
              <div className="relative mb-3">
                <select
                  className="w-full h-12 px-4 py-2 appearance-none rounded-xl border border-border/80 bg-secondary/30 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer hover:bg-secondary/50"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "new") {
                      setAddress("");
                      setCity("Phnom Penh");
                    } else {
                      const selected = savedAddresses.find(a => String(a.id) === val);
                      if (selected) {
                        setAddress(selected.address_line);
                        setCity(selected.city);
                      }
                    }
                  }}
                  defaultValue={
                    savedAddresses.find(a => a.address_line === address)?.id || 
                    (address ? "new" : "")
                  }
                >
                  <option value="" disabled className="text-muted-foreground bg-background">-- Choose a saved address --</option>
                  {savedAddresses.map(addr => (
                    <option key={addr.id} value={addr.id} className="bg-background text-foreground py-2">
                      {addr.label} ({addr.city})
                    </option>
                  ))}
                  <option value="new" className="bg-background text-primary font-medium py-2">+ Enter a new address...</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground">
                  <ChevronDown className="size-4 opacity-70" />
                </div>
              </div>
            )}
            <Input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address details" className="rounded-xl border-border/60" />
            <Input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="City / Province" className="rounded-xl border-border/60" />
          </div>
        </div>

        <div className="pt-2 border-t border-border/60">
          <h4 className="font-semibold text-sm mb-3">Payment Method</h4>
          <div className="grid grid-cols-4 gap-2">
            {methods.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMethod(id)}
                className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-xs font-semibold transition-colors ${method === id ? "border-primary bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:border-primary/50"
                  }`}
              >
                <Icon className="size-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {method === "CARD" && (
          <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
            <Input required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Cardholder name" />
            <Input required inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="Card number" maxLength={19} />
            <div className="grid grid-cols-2 gap-3">
              <Input required value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM / YY" maxLength={7} />
              <Input required inputMode="numeric" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="CVV" maxLength={4} />
            </div>
            <p className="text-[11px] text-muted-foreground">🔒 Your payment details are protected.</p>
          </div>
        )}

        {method === "ABA_PAY" && (
          <div className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col items-center text-center">
            <Wallet className="mx-auto size-8 text-primary" />
            <p className="mt-2 font-semibold text-foreground">Pay with ABA Pay</p>
            <p className="mt-1 text-sm text-muted-foreground mb-4">Please upload your payment receipt below.</p>
            <ImageUpload onUploadSuccess={(url) => setPaymentSlip(url)} />
          </div>
        )}

        {method === "KHQR" && (
          <div className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col items-center text-center">
            {qrCodeString ? (
              <>
                <div className="mx-auto flex size-44 items-center justify-center rounded-2xl bg-white p-3 shadow-inner" aria-label="KHQR payment code">
                  <QRCodeCanvas value={qrCodeString} size={152} includeMargin={true} />
                </div>
                <p className="mt-3 font-semibold text-foreground">Scan with Bakong App</p>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-full animate-pulse">
                  <span>⏱️</span>
                  <span>Expires in: {formatTime(timeLeft)}</span>
                </div>
                <button
                  type="button"
                  onClick={generateQR}
                  className="mt-3.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-full transition flex items-center gap-1"
                >
                  <span>🔄</span> Generate New QR
                </button>
                <p className="mt-2.5 text-xs text-muted-foreground">Flame &amp; Crust · Total ${total.toFixed(2)}</p>
              </>
            ) : (
              <div className="flex flex-col items-center py-4">
                <QrCode className="size-16 text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-5">Generate a unique KHQR code to pay ${total.toFixed(2)}</p>
                <Button type="button" onClick={generateQR} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <QrCode className="mr-2 size-4" /> Generate KHQR
                </Button>
              </div>
            )}
          </div>
        )}

        {method === "CASH" && (
          <div className="rounded-2xl border border-border/60 bg-card p-5 text-center">
            <Landmark className="mx-auto size-8 text-primary" />
            <p className="mt-2 font-semibold text-foreground">Cash on delivery</p>
            <p className="mt-1 text-sm text-muted-foreground">Please prepare the exact amount when your order arrives.</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-5">
          <span className="font-semibold text-foreground">Total to pay</span>
          <span className="font-serif text-2xl font-bold text-primary">${total.toFixed(2)}</span>
        </div>
        <Button type="submit" disabled={isSubmitting} className="h-13 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? (
            <>
              <div className="mr-2 size-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 size-5" /> Confirm payment
            </>
          )}
        </Button>
      </form>

      <AnimatePresence>
        {showMap && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="font-serif text-xl font-bold text-foreground mb-4">Pick Location</h3>
              <MapPicker
                onConfirm={(loc) => {
                  setAddress(loc.address);
                  setCity(loc.city);
                  setShowMap(false);
                  toast.success("Location picked successfully!");
                }}
                onClose={() => setShowMap(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
