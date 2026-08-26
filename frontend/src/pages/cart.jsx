"use client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Tag,
  Ticket,
  X,
  Loader2,
} from "lucide-react";
import { AvailableCoupons } from "@/components/food/available-coupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/food/navbar";
import { Footer } from "@/components/food/footer";
import { CartDrawer } from "@/components/food/cart-drawer";
import { EmptyState } from "@/components/shared/empty-state";
import { PageTransition } from "@/components/shared/page-transition";
import { useCart } from "@/lib/cart-store";
import { list } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 3.99;

function CartPage() {
  const navigate = useNavigate();
  const { lines, increment, decrement, removeItem, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const isCouponValid = couponApplied && (!couponApplied.min_order_amount || subtotal >= Number(couponApplied.min_order_amount));
  
  const discount = isCouponValid
    ? couponApplied.discount_type === "PERCENTAGE"
      ? Math.min(subtotal, (subtotal * Number(couponApplied.discount_value)) / 100)
      : couponApplied.discount_type === "FREE_DELIVERY"
        ? 0
        : Math.min(subtotal, Number(couponApplied.discount_value))
    : 0;
  const deliveryFee = (isCouponValid && couponApplied.discount_type === "FREE_DELIVERY")
    ? 0
    : (subtotal === 0 ? 0 : DELIVERY_FEE);
  const total = subtotal - discount + deliveryFee;

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      setCouponError("Enter a coupon code");
      return;
    }
    setIsApplying(true);
    setCouponError("");
    try {
      const coupons = await list("coupons");
      const found = coupons.find((item) => item.code?.toUpperCase() === coupon.trim().toUpperCase()
        && item.active && (!item.expires_at || new Date(item.expires_at) > new Date())
        && subtotal >= Number(item.min_order_amount || 0));
      if (!found) throw new Error("Invalid, expired, or minimum order not met");
      setCouponApplied(found);
      setCouponError("");
      toast.success(`Coupon "${found.code}" applied!`);
    } catch (error) {
      setCouponError(error.message || "Invalid coupon code");
      setCouponApplied(null);
      toast.error(error.message || "Invalid coupon code");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 pt-[calc(3.75rem+env(safe-area-inset-top))] sm:pt-24 pb-36 sm:pb-16">
        <PageTransition>
          <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8 py-2 sm:py-6">
            {/* Top Title (Desktop) */}
            <div className="hidden sm:flex items-center justify-between border-b border-border/40 pb-4 mb-6">
              <h1 className="font-serif text-3xl font-bold text-foreground">Your Cart</h1>
              <span className="text-sm text-muted-foreground font-medium">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            {lines.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Your cart is empty"
                description="Looks like you haven't added anything yet. Let's fix that — your cravings are waiting."
                actionLabel="Browse Menu"
                onAction={() => navigate("/menu")}
                className="py-16"
              />
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* 1. Cart Items List */}
                <div className="bg-card/70 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-border/70 p-3 sm:p-5 divide-y divide-border/40 shadow-xs">
                  <div className="flex items-center justify-between pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    <span>Selected Items ({itemCount})</span>
                    <button
                      onClick={() => {
                        clear();
                        toast.info("Cart cleared");
                      }}
                      className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="size-3" /> Clear all
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.div
                        key={line.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="py-3 sm:py-4 flex items-center gap-3 sm:gap-4"
                      >
                        {/* Food Image */}
                        <Link
                          to={`/product/${line.id}`}
                          className="size-16 sm:size-20 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 bg-secondary border border-border/50"
                        >
                          <img
                            src={line.image}
                            alt={line.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        {/* Title & Options */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${line.id}`}
                            className="font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {line.name}
                          </Link>
                          {line.description && (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {line.description}
                            </p>
                          )}
                          <p className="font-serif font-bold text-xs sm:text-sm text-primary mt-1">
                            ${Number(line.price).toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <div className="flex items-center rounded-full bg-secondary/80 border border-border/60 p-0.5">
                            <button
                              onClick={() => decrement(line.id)}
                              className="size-7 rounded-full bg-background hover:bg-primary hover:text-white text-foreground flex items-center justify-center transition-colors shadow-xs"
                              aria-label="Decrease"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="min-w-6 text-center font-bold text-xs text-foreground">
                              {line.qty}
                            </span>
                            <button
                              onClick={() => increment(line.id)}
                              className="size-7 rounded-full bg-background hover:bg-primary hover:text-white text-foreground flex items-center justify-center transition-colors shadow-xs"
                              aria-label="Increase"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(line.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
                            aria-label={`Remove ${line.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* 2. Promo Code & Coupons */}
                <div className="bg-card/70 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-border/70 p-3.5 sm:p-5 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="size-4 text-primary" />
                      <span className="font-bold text-xs sm:text-sm text-foreground">Promo Code & Coupons</span>
                    </div>

                    <AvailableCoupons
                      subtotal={subtotal}
                      onSelectCoupon={(selectedCoupon) => {
                        setCoupon(selectedCoupon.code);
                        setCouponApplied(selectedCoupon);
                        setCouponError("");
                        toast.success(`Coupon "${selectedCoupon.code}" applied!`);
                      }}
                    />
                  </div>

                  {couponApplied ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-xs font-semibold">
                        <Tag className="size-3.5" />
                        <span>
                          {couponApplied.code} applied (
                          {couponApplied.discount_type === "PERCENTAGE"
                            ? `${couponApplied.discount_value}% OFF`
                            : couponApplied.discount_type === "FREE_DELIVERY"
                              ? "Free Delivery"
                              : `-$${Number(couponApplied.discount_value).toFixed(2)}`}
                          )
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponApplied(null);
                          setCoupon("");
                        }}
                        className="p-1 hover:bg-green-500/20 rounded-full text-green-700 dark:text-green-300 transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                          <Input
                            value={coupon}
                            onChange={(e) => {
                              setCoupon(e.target.value);
                              setCouponError("");
                            }}
                            placeholder="Enter voucher code..."
                            className="pl-8 h-9 rounded-xl border-border/60 text-xs uppercase"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={!coupon.trim() || isApplying}
                          className="h-9 px-4 rounded-xl text-xs font-semibold shrink-0"
                        >
                          {isApplying ? <Loader2 className="size-3.5 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                      {couponError && <p className="text-[11px] text-destructive">{couponError}</p>}
                    </div>
                  )}
                </div>

                {/* 3. Order Breakdown Details */}
                <div className="bg-card/70 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-border/70 p-3.5 sm:p-5 space-y-2.5 shadow-xs text-xs">
                  <p className="font-bold text-xs sm:text-sm text-foreground pb-1 border-b border-border/40">
                    Payment Breakdown
                  </p>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                      <span>Discount ({couponApplied?.code})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className={cn("font-semibold", deliveryFee === 0 ? "text-green-600 dark:text-green-400" : "text-foreground")}>
                      {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2.5 border-t border-border/60">
                    <span className="font-bold text-sm text-foreground">Total Amount</span>
                    <span className="font-serif text-xl sm:text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Desktop Checkout Button (Hidden on Mobile) */}
                <div className="hidden sm:block pt-2">
                  <Button
                    onClick={() => navigate("/checkout", { state: { coupon: couponApplied } })}
                    className="w-full h-12 rounded-full bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-98 transition-all"
                  >
                    Proceed to Checkout (${total.toFixed(2)})
                    <ArrowRight className="size-5 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PageTransition>
      </main>

      {/* Sticky Bottom Bar for Mobile (Easy thumb tap, fits above bottom navbar) */}
      {lines.length > 0 && (
        <div className="sm:hidden fixed bottom-16 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border/80 p-3 shadow-lg px-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total ({itemCount} items)</p>
            <p className="font-serif text-xl font-bold text-primary leading-tight">${total.toFixed(2)}</p>
          </div>
          <Button
            onClick={() => navigate("/checkout", { state: { coupon: couponApplied } })}
            className="h-11 px-6 rounded-full bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm shadow-md shadow-primary/25 active:scale-95 transition-all"
          >
            Checkout
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default CartPage;
