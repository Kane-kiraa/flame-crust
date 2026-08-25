"use client";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Landmark,
  QrCode,
  Wallet,
  Lock,
  X,
  Loader2,
  LocateFixed,
  MapPin,
} from "lucide-react";
import { AvailableCoupons } from "@/components/food/available-coupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/food/navbar";
import { Footer } from "@/components/food/footer";
import { CartDrawer } from "@/components/food/cart-drawer";
import { MapPicker } from "@/components/food/map-picker";
import { PageTransition } from "@/components/shared/page-transition";
import { AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-store";
import { create, list } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 25;

const paymentMethods = [
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "KHQR", label: "KHQR", icon: QrCode },
  { id: "ABA_PAY", label: "ABA Pay", icon: Wallet },
  { id: "CASH", label: "Cash", icon: Landmark },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lines, clear, coupon, applyCoupon, removeCoupon } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = localStorage.getItem("customerAuth");
      if (auth) {
        const c = JSON.parse(auth);
        setCustomer(c);
        try {
          const allAddresses = await list("addresses");
          const myAddresses = allAddresses.filter(a => String(a.customer_id) === String(c.id));
          setSavedAddresses(myAddresses);
          
          // Auto-fill form if they have a default address
          const defaultAddr = myAddresses.find(a => a.is_default) || myAddresses[0];
          if (defaultAddr) {
            handleSelectAddress(defaultAddr, c);
          } else {
            setValue("fullName", c.name);
            setValue("phone", c.phone);
          }
        } catch (e) {}
      }
    };
    fetchProfile();
  }, []);

  const handleSelectAddress = (addr, c = customer) => {
    if (c) {
      setValue("fullName", c.name);
      setValue("phone", c.phone);
    }
    // Parse address line and city
    setValue("address1", addr.address_line);
    setValue("city", addr.city);
    setValue("notes", addr.notes || "");
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

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
          
          setValue("address1", data.display_name);
          setValue("city", cityMatch || "Phnom Penh");
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

  const grossSubtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const isCouponValid = coupon && (!coupon.min_order_amount || grossSubtotal >= Number(coupon.min_order_amount));
  const discount = isCouponValid
    ? coupon.discount_type === "PERCENTAGE"
      ? Math.min(grossSubtotal, (grossSubtotal * Number(coupon.discount_value)) / 100)
      : coupon.discount_type === "FREE_DELIVERY"
        ? 0
        : Math.min(grossSubtotal, Number(coupon.discount_value))
    : 0;
  const subtotal = grossSubtotal - discount;
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const deliveryFee = (isCouponValid && coupon.discount_type === "FREE_DELIVERY") 
    ? 0 
    : (subtotal === 0 ? 0 : DELIVERY_FEE);
  const total = subtotal + deliveryFee;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setCouponError("");
    try {
      const coupons = await list("coupons");
      const found = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
      if (!found) {
        setCouponError("Invalid promo code");
      } else if (!found.active) {
        setCouponError("This code is no longer active");
      } else if (found.min_order_amount && grossSubtotal < Number(found.min_order_amount)) {
        setCouponError(`Minimum order amount is $${Number(found.min_order_amount).toFixed(2)}`);
      } else {
        applyCoupon(found);
        setCouponCode("");
      }
    } catch (err) {
      setCouponError("Failed to apply code");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const onSubmit = async (data) => {
    if (lines.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setSubmitting(true);
    try {
      const customers = await list("customers");
      let customer = customers.find((item) => item.phone === data.phone);
      if (!customer) {
        customer = await create("customers", {
          name: data.fullName,
          phone: data.phone,
          email: data.email || null,
          status: "ACTIVE",
        });
      }
      const address = await create("addresses", {
        customer_id: customer.id,
        label: data.addressLabel || "Home",
        address_line: `${data.address1}${data.address2 ? `, ${data.address2}` : ""}`,
        city: data.city,
        notes: data.notes || null,
        is_default: true,
      });
      const order = await create("orders", {
        order_number: `FC-${Date.now()}`,
        customer_id: customer.id,
        address_id: address.id,
        status: "PENDING",
        order_type: "DELIVERY",
        subtotal,
        discount_amount: discount,
        delivery_fee: deliveryFee,
        driver_commission: 0,
        total,
        notes: data.notes || null,
      });
      const orderId = order.id;
      await Promise.all(
        lines.map((line) =>
          create("order_items", {
            order_id: orderId,
            product_id: Number(line.originalId || line.id),
            product_name: line.name,
            quantity: line.qty,
            unit_price: line.price,
            line_total: line.price * line.qty,
            status: "PENDING",
            options: line.selectedOptions ? JSON.stringify(line.selectedOptions) : null,
          })
        )
      );
      await create("payments", {
        order_id: orderId,
        method: paymentMethod,
        amount: total,
        status: "PENDING",
      });

      clear();
      removeCoupon();

      if (paymentMethod === "KHQR" || paymentMethod === "ABA_PAY" || paymentMethod === "CARD") {
        navigate(`/payment/${orderId}`, { state: { total, paymentMethod } });
      } else {
        navigate("/order-confirmation", {
          state: {
            orderId,
            total,
            itemCount,
            paymentMethod,
            address: `${data.address1}${data.address2 ? `, ${data.address2}` : ""}, ${data.city}`,
          },
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to place order. Please try again.");
      setSubmitting(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))]">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center">
            <h2 className="font-serif text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Add items before checking out.</p>
            <Button
              onClick={() => navigate("/menu")}
              className="mt-6 rounded-full bg-primary text-primary-foreground"
            >
              Browse menu
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-28">
        <PageTransition>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/cart")}
              className="mb-6 rounded-full text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="size-4 mr-1" />
              Back to cart
            </Button>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">Checkout</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid lg:grid-cols-[1fr_380px] gap-10">
              <div className="space-y-8">
                <div className="rounded-3xl border border-white/5 bg-card/60 backdrop-blur-xl shadow-lg p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5">
                    <h2 className="font-serif text-xl font-bold text-foreground">Delivery address</h2>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={handleAutoLocation} disabled={isLocating} className="rounded-full text-xs h-8">
                        <LocateFixed className={cn("size-3 mr-1.5", isLocating && "animate-spin")} />
                        {isLocating ? "Locating..." : "Auto Location"}
                      </Button>
                    </div>
                  </div>
                  
                  {savedAddresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <Label className="text-muted-foreground">Saved Addresses</Label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {savedAddresses.map(addr => (
                          <div 
                            key={addr.id} 
                            onClick={() => handleSelectAddress(addr)}
                            className="cursor-pointer bg-secondary/50 hover:bg-primary/10 border border-transparent hover:border-primary/30 rounded-xl p-3 transition-colors relative"
                          >
                            {addr.is_default && <span className="absolute top-2 right-2 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">Default</span>}
                            <p className="font-bold text-sm text-foreground">{addr.label || "Address"}</p>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{addr.address_line}</p>
                            <p className="text-xs text-muted-foreground truncate">{addr.city}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 py-2">
                        <div className="h-px bg-border flex-1"></div>
                        <span className="text-xs text-muted-foreground uppercase font-bold">Or enter new</span>
                        <div className="h-px bg-border flex-1"></div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName">Full name <span className="text-destructive">*</span></Label>
                        <Input id="fullName" {...register("fullName", { required: "Name is required" })} placeholder="John Doe" className={cn("rounded-xl border-border/60", errors.fullName && "border-destructive")} />
                        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                        <Input id="phone" type="tel" {...register("phone", { required: "Phone is required" })} placeholder="+855 12 345 678" className={cn("rounded-xl border-border/60", errors.phone && "border-destructive")} />
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="address1">Address line 1 <span className="text-destructive">*</span></Label>
                      <Input id="address1" {...register("address1", { required: "Address is required" })} placeholder="Street address" className={cn("rounded-xl border-border/60", errors.address1 && "border-destructive")} />
                      {errors.address1 && <p className="text-xs text-destructive">{errors.address1.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="address2">Address line 2</Label>
                      <Input id="address2" {...register("address2")} placeholder="Apt, suite, unit (optional)" className="rounded-xl border-border/60" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                      <Input id="city" {...register("city", { required: "City is required" })} placeholder="Phnom Penh" className={cn("rounded-xl border-border/60", errors.city && "border-destructive")} />
                      {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="notes">Delivery notes</Label>
                      <Textarea id="notes" {...register("notes")} placeholder="Gate code, landmarks, etc." className="rounded-xl border-border/60 min-h-20" />
                    </div>
                  </div>

                </div>

                <div className="rounded-3xl border border-white/5 bg-card/60 backdrop-blur-xl shadow-lg p-6 sm:p-8">
                  <h2 className="font-serif text-xl font-bold text-foreground mb-6">Payment method</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {paymentMethods.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={cn("flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-sm font-semibold transition-colors", paymentMethod === id ? "border-primary bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:border-primary/50")}
                      >
                        <Icon className="size-6" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "CARD" && (
                    <div className="space-y-3 rounded-2xl border border-border/60 bg-background p-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="cardName">Cardholder name</Label>
                        <Input
                          id="cardName"
                          {...register("cardName", { required: paymentMethod === "CARD" })}
                          placeholder="John Doe"
                          className="rounded-xl border-border/60"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cardNumber">Card number</Label>
                        <Input
                          id="cardNumber"
                          inputMode="numeric"
                          {...register("cardNumber", { required: paymentMethod === "CARD" })}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          className="rounded-xl border-border/60"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="expiry">Expiry</Label>
                          <Input
                            id="expiry"
                            {...register("expiry", { required: paymentMethod === "CARD" })}
                            placeholder="MM / YY"
                            maxLength={7}
                            className="rounded-xl border-border/60"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            inputMode="numeric"
                            {...register("cvv", { required: paymentMethod === "CARD" })}
                            placeholder="123"
                            maxLength={4}
                            className="rounded-xl border-border/60"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Lock className="size-3" /> Your payment details are protected.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "ABA_PAY" && (
                    <div className="rounded-2xl border border-border/60 bg-background p-5 text-center">
                      <Wallet className="mx-auto size-8 text-primary" />
                      <p className="mt-2 font-semibold text-foreground">Pay with ABA Pay</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You'll be redirected to scan the QR code.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "KHQR" && (
                    <div className="rounded-2xl border border-border/60 bg-background p-5 text-center">
                      <QrCode className="mx-auto size-12 text-primary" />
                      <p className="mt-2 font-semibold text-foreground">Scan with any KHQR app</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You'll be redirected to scan the QR code.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "CASH" && (
                    <div className="rounded-2xl border border-border/60 bg-background p-5 text-center">
                      <Landmark className="mx-auto size-8 text-primary" />
                      <p className="mt-2 font-semibold text-foreground">Cash on delivery</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Please prepare the exact amount when your order arrives.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:sticky lg:top-32 lg:self-start">
                <div className="rounded-3xl border border-white/5 bg-card/80 backdrop-blur-2xl shadow-xl p-6 sm:p-8 space-y-6">
                  <h2 className="font-serif text-xl font-bold text-foreground">Order summary</h2>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {lines.map((line) => (
                      <div key={line.id} className="flex gap-3">
                        <div className="size-14 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                          <img src={line.image} alt={line.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{line.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {line.qty}</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground flex-shrink-0">${(line.price * line.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border/60">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Promo Code</h3>
                    {coupon ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 text-green-600">
                          <Ticket className="size-4" />
                          <span className="font-semibold text-sm">{coupon.code} applied</span>
                        </div>
                        <button onClick={() => removeCoupon()} className="p-1 hover:bg-green-500/20 rounded-full text-green-700">
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter code..." className="rounded-xl border-border/60" />
                        <Button type="submit" disabled={!couponCode || isApplyingCoupon} className="rounded-xl">
                          {isApplyingCoupon ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                        </Button>
                      </form>
                    )}
                    {couponError && <p className="text-xs text-destructive mt-2">{couponError}</p>}
                    {!coupon && (
                      <AvailableCoupons 
                        subtotal={grossSubtotal} 
                        onSelectCoupon={(selectedCoupon) => {
                          applyCoupon(selectedCoupon);
                          setCouponCode("");
                          setCouponError("");
                          toast.success(`Coupon "${selectedCoupon.code}" applied!`);
                        }} 
                      />
                    )}
                  </div>

                  <div className="border-t border-border/60 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-foreground/80">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">${grossSubtotal.toFixed(2)}</span>
                    </div>
                    {coupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-foreground/80">
                      <span>Delivery fee</span>
                      <span className={cn("font-medium", deliveryFee === 0 ? "text-green-600" : "text-foreground")}>
                        {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t border-border/60">
                    <span className="font-serif text-lg font-bold text-foreground">Total</span>
                    <span className="font-serif text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 rounded-full bg-gradient-to-r from-primary to-orange-500 text-white hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 text-lg font-bold"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        Place order
                        <ArrowRight className="size-5 ml-1" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    🔒 Secure checkout · Estimated delivery 25–35 min
                  </p>
                </div>
              </div>
            </form>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}

export default CheckoutPage;
