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
  Sparkles,
  Tag,
  Loader2,
  PartyPopper,
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
const FREE_DELIVERY_THRESHOLD = 25;
const SERVICE_FEE = 0.99;

function CartPage() {
  const navigate = useNavigate();
  const { lines, increment, decrement, removeItem, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState("");

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const isCouponValid = couponApplied && (!couponApplied.min_order_amount || subtotal >= Number(couponApplied.min_order_amount));
  
  const discount = isCouponValid
    ? couponApplied.discount_type === "PERCENTAGE"
      ? Math.min(subtotal, subtotal * Number(couponApplied.discount_value) / 100)
      : couponApplied.discount_type === "FREE_DELIVERY"
        ? 0
        : Math.min(subtotal, Number(couponApplied.discount_value))
    : 0;
  const deliveryFee = (isCouponValid && couponApplied.discount_type === "FREE_DELIVERY")
    ? 0
    : (subtotal === 0 ? 0 : DELIVERY_FEE);
  const total = subtotal - discount + deliveryFee + (subtotal > 0 ? SERVICE_FEE : 0);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      setCouponError("Enter a coupon code");
      return;
    }
    try {
      const coupons = await list("coupons");
      const found = coupons.find((item) => item.code?.toUpperCase() === coupon.trim().toUpperCase()
        && item.active && (!item.expires_at || new Date(item.expires_at) > new Date())
        && subtotal >= Number(item.min_order_amount || 0));
      if (!found) throw new Error("Invalid, expired, or unavailable coupon");
      setCouponApplied(found);
      setCouponError("");
      toast.success("Coupon applied");
    } catch (error) {
      setCouponError("Invalid coupon code");
      setCouponApplied(null);
      toast.error(error.message || "Invalid coupon code");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-28">
        <PageTransition>
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">Your Cart</h1>

            {lines.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Your cart is empty"
                description="Looks like you haven't added anything yet. Let's fix that — your cravings are waiting."
                actionLabel="Browse the menu"
                onAction={() => navigate("/menu")}
                className="py-16"
              />
            ) : (
              <div className="mt-8">
                {/* Cart items */}
                <div className="space-y-0">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.div
                        key={line.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 py-5 border-b border-border/60"
                      >
                        <Link
                          to={`/product/${line.id}`}
                          className="size-24 sm:size-28 rounded-2xl overflow-hidden flex-shrink-0 bg-secondary"
                        >
                          <img
                            src={line.image}
                            alt={line.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex justify-between gap-2">
                            <Link
                              to={`/product/${line.id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {line.name}
                            </Link>
                            <button
                              onClick={() => removeItem(line.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1 -m-1 flex-shrink-0"
                              aria-label={`Remove ${line.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {line.description}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center gap-1 rounded-full bg-secondary border border-border/60 p-0.5">
                              <button
                                onClick={() => decrement(line.id)}
                                className="size-8 rounded-full bg-background hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="min-w-7 text-center font-semibold text-sm text-foreground">
                                {line.qty}
                              </span>
                              <button
                                onClick={() => increment(line.id)}
                                className="size-8 rounded-full bg-background hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <span className="font-serif font-bold text-foreground text-lg">
                              ${(line.price * line.qty).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Coupon */}
                <div className="mt-6 flex gap-2 items-start">
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          value={coupon}
                          onChange={(e) => {
                            setCoupon(e.target.value);
                            setCouponError("");
                            setCouponApplied(false);
                          }}
                          placeholder="Coupon code (try FLAME10)"
                          className="pl-9 rounded-full border-border/60"
                          disabled={couponApplied}
                        />
                      </div>
                      <Button
                        onClick={handleApplyCoupon}
                        variant="outline"
                        className="rounded-full px-5 border-border/60"
                        disabled={couponApplied}
                      >
                        {couponApplied ? "Applied" : "Apply"}
                      </Button>
                    </div>
                    {couponError && <p className="text-sm text-destructive mt-2 ml-4">{couponError}</p>}
                    {!couponApplied && (
                      <div className="ml-4">
                        <AvailableCoupons onSelectCoupon={(c) => {
                          setCoupon(c);
                          // Auto apply could be done, but let's just populate the field and they can click apply
                        }} />
                      </div>
                    )}
                    {couponApplied && (
                          <p className="text-xs text-green-600 mt-1 ml-1 font-medium">
                        ✓ {couponApplied.discount_type === "PERCENTAGE"
                          ? `${couponApplied.discount_value}% discount applied`
                          : `$${Number(couponApplied.discount_value).toFixed(2)} discount applied`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 space-y-3">
                  <h3 className="font-serif text-lg font-bold text-foreground mb-4">Order summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-foreground/80">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount (10%)</span>
                        <span className="font-medium">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-foreground/80">
                      <span>Delivery fee</span>
                      <span
                        className={cn(
                          "font-medium",
                          deliveryFee === 0 ? "text-green-600" : "text-foreground"
                        )}
                      >
                        {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-foreground/80">
                      <span>Service fee</span>
                      <span className="font-medium text-foreground">${SERVICE_FEE.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-border/60">
                    <span className="font-serif text-lg font-bold text-foreground">Total</span>
                    <span className="font-serif text-3xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={() => navigate("/checkout", { state: { coupon: couponApplied } })}
                    className="w-full h-13 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm text-base font-semibold mt-4"
                  >
                    Proceed to checkout
                    <ArrowRight className="size-5 ml-1" />
                  </Button>
                  <div className="flex gap-2 justify-center mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        clear();
                        toast.info("Cart cleared");
                      }}
                      className="text-muted-foreground hover:text-destructive rounded-full"
                    >
                      <Trash2 className="size-4 mr-1" />
                      Clear cart
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}

export default CartPage;
