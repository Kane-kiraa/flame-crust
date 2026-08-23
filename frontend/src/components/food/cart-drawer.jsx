"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  ArrowRight,
  Sparkles,
  Ticket,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider.jsx";
import { PaymentForm } from "./payment-form.jsx";
import { AvailableCoupons } from "./available-coupons.jsx";
import { useNavigate } from "react-router-dom";
const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 25;
const SERVICE_FEE = 0.99;
function CartDrawer() {
  const navigate = useNavigate();
  const { isOpen, closeCart, lines, increment, decrement, removeItem, clear, coupon, applyCoupon, clearCoupon } = useCart();
  const [mounted, setMounted] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const grossSubtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const isCouponValid = coupon && (!coupon.min_order_amount || grossSubtotal >= Number(coupon.min_order_amount));
  
  const discount = isCouponValid
    ? coupon.discount_type === "PERCENTAGE"
      ? Math.min(grossSubtotal, grossSubtotal * Number(coupon.discount_value) / 100)
      : coupon.discount_type === "FREE_DELIVERY"
        ? 0
        : Math.min(grossSubtotal, Number(coupon.discount_value))
    : 0;

  const subtotal = Math.max(0, grossSubtotal - discount);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const deliveryFee = (isCouponValid && coupon.discount_type === "FREE_DELIVERY") 
    ? 0 
    : (grossSubtotal === 0 ? 0 : DELIVERY_FEE);
  const total = subtotal + deliveryFee + (grossSubtotal > 0 ? SERVICE_FEE : 0);
  const handleCheckout = () => {
    try {
      const stored = localStorage.getItem("customerAuth");
      if (!stored) {
        toast.error("សូមបញ្ជាក់ការចូលប្រើ (Sign In) មុននឹងទិញទំនិញ!");
        closeCart();
        navigate("/login");
        return;
      }
      setPaymentOpen(true);
    } catch (e) {
      toast.error("សូមបញ្ជាក់ការចូលប្រើ (Sign In) មុននឹងទិញទំនិញ!");
      closeCart();
      navigate("/login");
    }
  };
  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      const { create } = await import("@/lib/api");
      let customer = null;
      try {
        const stored = localStorage.getItem("customerAuth");
        if (stored) customer = JSON.parse(stored);
      } catch (e) {}

      let customerId = customer?.id;
      if (!customerId) {
        toast.error("អ្នកមិនទាន់បាន Sign In ទេ! សូម Sign In ម្តងទៀត!");
        return;
      }

      const addressRes = await create("addresses", {
        customer_id: customerId,
        label: "Delivery",
        address_line: paymentDetails.address || "Unknown location",
        city: paymentDetails.city || "Phnom Penh",
        is_default: 1
      });

      const finalDeliveryAndServiceFee = deliveryFee + (subtotal > 0 ? SERVICE_FEE : 0);
      const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      const orderRes = await create("orders", {
        order_number: orderNumber,
        customer_id: customerId,
        address_id: addressRes.id,
        coupon_id: coupon?.id || null,
        status: "PENDING",
        subtotal: subtotal,
        discount_amount: discount,
        delivery_fee: finalDeliveryAndServiceFee,
        total: total,
        notes: "Payment: " + paymentDetails.method
      });

      for (const line of lines) {
        await create("order_items", {
          order_id: orderRes.id,
          product_id: Number(line.originalId || line.id) || parseInt(String(line.originalId || line.id).replace(/\D/g, '')) || 1,
          product_name: line.name,
          quantity: line.qty,
          unit_price: line.price,
          line_total: line.price * line.qty,
          options: line.selectedOptions ? JSON.stringify(line.selectedOptions) : null
        });
      }

      const dbMethod = ["CASH", "CARD", "ABA_PAY", "WING"].includes(paymentDetails.method) ? paymentDetails.method : "OTHER";
      const dbStatus = paymentDetails.method === "CASH" ? "PENDING" : "PAID";

      await create("payments", {
        order_id: orderRes.id,
        method: dbMethod,
        status: dbStatus,
        amount: total,
        transaction_id: paymentDetails.method === "CASH" ? null : "TXN-" + Date.now()
      });

      setPaymentOpen(false);
      closeCart();
      clear();
      toast.success("Order Placed Successfully!");
      window.dispatchEvent(new CustomEvent("orderPlaced"));
      navigate(`/track/${orderRes.id}`);
    } catch (error) {
      if (error.message && error.message.toLowerCase().includes("constraint")) {
        localStorage.removeItem("customerAuth");
        toast.error("Your session has expired or is invalid. Please sign in again.");
        window.location.href = "/login";
      } else {
        toast.error("Failed to place order: " + error.message);
      }
    }
  };
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setIsApplying(true);
    setCouponError("");
    try {
      const { list } = await import("@/lib/api");
      const coupons = await list("coupons");
      const found = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
      if (!found || !found.active) {
        setCouponError("Invalid or inactive promo code.");
      } else {
        applyCoupon(found);
        setCouponCode("");
      }
    } catch {
      setCouponError("Failed to apply code.");
    } finally {
      setIsApplying(false);
    }
  };
  if (!mounted) return null;
  return /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: "linear" },
        onClick: closeCart,
        className: "fixed inset-0 z-50 bg-black/55 backdrop-blur-md touch-none overscroll-contain"
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.aside,
      {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
        className: "fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md lg:max-w-lg bg-background/85 backdrop-blur-3xl shadow-2xl sm:border-l border-border/50 flex flex-col will-change-transform transform-gpu sm:rounded-l-[2.5rem] overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 sm:px-6 py-5 border-b border-border/60", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(ShoppingBag, { className: "size-5" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-serif text-2xl font-bold text-foreground tracking-tight", children: "Your order" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-primary mt-0.5", children: [
                  itemCount,
                  " item",
                  itemCount !== 1 ? "s" : "",
                  " in cart"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              lines.length > 0 && /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => {
                    clear();
                    toast.info("Cart cleared");
                  },
                  className: "text-muted-foreground hover:text-destructive",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  onClick: closeCart,
                  className: "rounded-full",
                  children: /* @__PURE__ */ jsx(X, { className: "size-5" })
                }
              )
            ] })
          ] }),
          paymentOpen && <PaymentForm total={total} onBack={() => setPaymentOpen(false)} onSuccess={handlePaymentSuccess} />,
          lines.length === 0 ? (
            /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center px-8 text-center gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx("div", { className: "size-28 rounded-full bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsx(ShoppingBag, { className: "size-12 text-muted-foreground" }) }),
                /* @__PURE__ */ jsx("div", { className: "absolute -top-1 -right-1 size-8 rounded-full bg-accent flex items-center justify-center animate-flicker", children: /* @__PURE__ */ jsx(Sparkles, { className: "size-4 text-accent-foreground" }) })
              ] }),
              /* @__PURE__ */ jsx("h4", { className: "font-serif text-2xl font-bold text-foreground", children: "Your cart is empty" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-xs", children: "Looks like you haven't added anything yet. Let's fix that \u2014 your cravings are waiting." }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  onClick: closeCart,
                  className: "mt-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6",
                  children: [
                    "Browse the menu",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "size-4 ml-1" })
                  ]
                }
              )
            ] })
          ) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-5 sm:px-6 py-4", children: /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: lines.map((line) => /* @__PURE__ */ jsxs(
              motion.div,
              {
                layout: "position",
                initial: { opacity: 0, height: 0 },
                animate: { opacity: 1, height: "auto" },
                exit: { opacity: 0, x: -40 },
                transition: { duration: 0.25 },
                className: "flex gap-4 p-4 rounded-3xl bg-secondary/30 border border-white/5 hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300 mb-4 last:mb-0 group shadow-sm",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "size-20 rounded-2xl overflow-hidden flex-shrink-0 bg-secondary", children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: line.image,
                      alt: line.name,
                      className: "w-full h-full object-cover"
                    }
                  ) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-2", children: [
                      /* @__PURE__ */ jsx("h4", { className: "font-semibold text-foreground text-sm leading-snug", children: line.name }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => removeItem(line.id),
                          className: "text-muted-foreground hover:text-destructive transition-colors p-1 -m-1",
                          "aria-label": `Remove ${line.name}`,
                          children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5 line-clamp-1", children: line.description }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-auto flex items-center justify-between pt-2", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 rounded-full bg-secondary border border-border/60 p-0.5", children: [
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => decrement(line.id),
                            className: "size-7 rounded-full bg-background hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center transition-colors",
                            "aria-label": "Decrease quantity",
                            children: /* @__PURE__ */ jsx(Minus, { className: "size-3.5" })
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { className: "min-w-6 text-center font-semibold text-sm text-foreground", children: line.qty }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => increment(line.id),
                            className: "size-7 rounded-full bg-background hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center transition-colors",
                            "aria-label": "Increase quantity",
                            children: /* @__PURE__ */ jsx(Plus, { className: "size-3.5" })
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs("span", { className: "font-serif font-bold text-foreground", children: [
                        "$",
                        (line.price * line.qty).toFixed(2)
                      ] })
                    ] })
                  ] })
                ]
              },
              line.id
            )) }) }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-border/50 px-5 sm:px-6 py-5 bg-background/90 backdrop-blur-md space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-sm", children: [
                /* Coupon section */
                /* @__PURE__ */ jsxs("div", { className: "pb-2 mb-2 border-b border-border/60", children: [
                  coupon ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 rounded bg-green-500/10 text-green-600 text-xs", children: [
                    /* @__PURE__ */ jsxs("span", { className: "font-semibold flex items-center gap-1", children: [/* @__PURE__ */ jsx(Ticket, { className: "size-3" }), coupon.code] }),
                    /* @__PURE__ */ jsx("button", { onClick: clearCoupon, className: "p-1 hover:bg-green-500/20 rounded-full", children: /* @__PURE__ */ jsx(X, { className: "size-3" }) })
                  ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleApplyCoupon, className: "flex gap-2", children: [
                    /* @__PURE__ */ jsx("input", { type: "text", value: couponCode, onChange: (e) => setCouponCode(e.target.value), placeholder: "Promo code", className: "flex-1 h-8 px-2 rounded bg-background border border-border/60 text-xs uppercase" }),
                    /* @__PURE__ */ jsx(Button, { type: "submit", disabled: !couponCode || isApplying, size: "sm", className: "h-8 px-3 rounded text-xs", children: isApplying ? /* @__PURE__ */ jsx(Loader2, { className: "size-3 animate-spin" }) : "Apply" })
                  ] }),
                  couponError && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-destructive mt-1", children: couponError }),
                  !coupon && /* @__PURE__ */ jsx(AvailableCoupons, { onSelectCoupon: setCouponCode })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-foreground/80", children: [
                  /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
                  /* @__PURE__ */ jsxs("span", { className: "font-medium text-foreground", children: [
                    "$",
                    grossSubtotal.toFixed(2)
                  ] })
                ] }),
                coupon && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-green-600", children: [
                  /* @__PURE__ */ jsx("span", { children: "Discount" }),
                  /* @__PURE__ */ jsxs("span", { className: "font-medium", children: ["-$", discount.toFixed(2)] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-foreground/80", children: [
                  /* @__PURE__ */ jsx("span", { children: "Delivery fee" }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: cn(
                        "font-medium",
                        deliveryFee === 0 ? "text-green-600" : "text-foreground"
                      ),
                      children: deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-foreground/80", children: [
                  /* @__PURE__ */ jsx("span", { children: "Service fee" }),
                  /* @__PURE__ */ jsxs("span", { className: "font-medium text-foreground", children: [
                    "$",
                    SERVICE_FEE.toFixed(2)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline pt-2 border-t border-border/60", children: [
                /* @__PURE__ */ jsx("span", { className: "font-serif text-lg font-bold text-foreground", children: "Total" }),
                /* @__PURE__ */ jsxs("span", { className: "font-serif text-2xl font-bold text-primary", children: [
                  "$",
                  total.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  onClick: handleCheckout,
                  className: "w-full h-14 rounded-full bg-gradient-to-r from-primary via-orange-500 to-primary bg-[length:200%_auto] animate-gradient text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-[1.02] transition-all duration-300 text-base font-bold",
                  children: [
                    "Place order",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "size-5 ml-1" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-center text-[11px] text-muted-foreground", children: "\u{1F512} Secure checkout \xB7 Estimated delivery 25\u201335 min" })
            ] })
          ] })
        ]
      }
    )
  ] }) });
}
export {
  CartDrawer
};
