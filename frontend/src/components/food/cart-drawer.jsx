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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PaymentForm } from "./payment-form.jsx";
const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 25;
const SERVICE_FEE = 0.99;
function CartDrawer() {
  const { isOpen, closeCart, lines, increment, decrement, removeItem, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee + (subtotal > 0 ? SERVICE_FEE : 0);
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progressToFree = Math.min(100, subtotal / FREE_DELIVERY_THRESHOLD * 100);
  const handleCheckout = () => {
    setPaymentOpen(true);
  };
  const handlePaymentSuccess = () => {
    toast.success("Order placed!", {
      description: `Your ${itemCount} item${itemCount > 1 ? "s" : ""} are being prepared \u{1F525}`
    });
    clear();
    setPaymentOpen(false);
    closeCart();
  };
  if (!mounted) return null;
  return /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: closeCart,
        className: "fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.aside,
      {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { type: "spring", stiffness: 380, damping: 38 },
        className: "fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md lg:max-w-lg bg-background shadow-warm-lg flex flex-col",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 sm:px-6 py-5 border-b border-border/60", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(ShoppingBag, { className: "size-5" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl font-bold text-foreground", children: "Your order" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
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
          paymentOpen && /* @__PURE__ */ jsx(PaymentForm, { total, onBack: () => setPaymentOpen(false), onSuccess: handlePaymentSuccess }),
          lines.length === 0 ? (
            /* Empty state */
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
            /* @__PURE__ */ jsxs("div", { className: "px-5 sm:px-6 py-4 bg-secondary/40 border-b border-border/60", children: [
              remainingForFree > 0 ? /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm text-foreground/80", children: [
                "Add",
                " ",
                /* @__PURE__ */ jsxs("span", { className: "font-bold text-primary", children: [
                  "$",
                  remainingForFree.toFixed(2)
                ] }),
                " ",
                "more for free delivery"
              ] }) : /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm font-semibold text-green-600 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "size-3.5" }),
                " You've unlocked free delivery!"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 h-1.5 rounded-full bg-border overflow-hidden", children: /* @__PURE__ */ jsx(
                motion.div,
                {
                  className: "h-full rounded-full bg-gradient-to-r from-primary to-accent",
                  animate: { width: `${progressToFree}%` },
                  transition: { type: "spring", stiffness: 120, damping: 20 }
                }
              ) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-5 sm:px-6 py-4", children: /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: lines.map((line) => /* @__PURE__ */ jsxs(
              motion.div,
              {
                layout: true,
                initial: { opacity: 0, height: 0 },
                animate: { opacity: 1, height: "auto" },
                exit: { opacity: 0, x: -40 },
                transition: { duration: 0.25 },
                className: "flex gap-3 py-4 border-b border-border/60 last:border-b-0",
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
            /* @__PURE__ */ jsxs("div", { className: "border-t border-border/60 px-5 sm:px-6 py-4 bg-card space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-foreground/80", children: [
                  /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
                  /* @__PURE__ */ jsxs("span", { className: "font-medium text-foreground", children: [
                    "$",
                    subtotal.toFixed(2)
                  ] })
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
                  className: "w-full h-13 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm text-base font-semibold",
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
