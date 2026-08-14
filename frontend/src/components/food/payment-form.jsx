import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Landmark, QrCode, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";
import { BakongKHQR, MerchantInfo } from "bakong-khqr";

const methods = [
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "KHQR", label: "KHQR", icon: QrCode },
  { id: "ABA_PAY", label: "ABA Pay", icon: Wallet },
  { id: "CASH", label: "Cash", icon: Landmark }
];

export function PaymentForm({ total, onBack, onSuccess }) {
  const [method, setMethod] = useState("CARD");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [qrCodeString, setQrCodeString] = useState("");

  // Generate KHQR when total changes
  useEffect(() => {
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
  }, [total]);

  const submitPayment = (event) => {
    event.preventDefault();
    if (method === "CARD" && (!card.name || !card.number || !card.expiry || !card.cvv)) {
      toast.error("Please complete your card details");
      return;
    }
    toast.success("Payment method saved", { description: "Your order is ready to place." });
    onSuccess({ method, cardLast4: method === "CARD" ? card.number.slice(-4) : null });
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

      <form onSubmit={submitPayment} className="space-y-5 pt-6">
        <div className="grid grid-cols-4 gap-2">
          {methods.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMethod(id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-xs font-semibold transition-colors ${
                method === id ? "border-primary bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
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
          <div className="rounded-2xl border border-border/60 bg-card p-5 text-center">
            <Wallet className="mx-auto size-8 text-primary" />
            <p className="mt-2 font-semibold text-foreground">Pay with ABA Pay</p>
            <p className="mt-1 text-sm text-muted-foreground">You will receive payment instructions after placing the order.</p>
          </div>
        )}

        {method === "KHQR" && (
          <div className="rounded-2xl border border-border/60 bg-card p-5 text-center">
            <div className="mx-auto flex size-44 items-center justify-center rounded-xl bg-white shadow-inner overflow-hidden" aria-label="KHQR payment code">
              {qrCodeString ? (
                <QRCodeCanvas value={qrCodeString} size={176} includeMargin={false} />
              ) : (
                <QrCode className="size-24 text-zinc-900 opacity-50" />
              )}
            </div>
            <p className="mt-3 font-semibold text-foreground">Scan with any KHQR app</p>
            <p className="mt-1 text-sm text-muted-foreground">Flame &amp; Crust · Total ${total.toFixed(2)}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">KHQR payment will be verified after you place the order.</p>
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
        <Button type="submit" className="h-13 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90">
          <CheckCircle2 className="mr-2 size-5" /> Confirm payment
        </Button>
      </form>
    </div>
  );
}
