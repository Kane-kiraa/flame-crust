"use client";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
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
import { EmptyState } from "@/components/shared/empty-state";
import { PageTransition } from "@/components/shared/page-transition";
import { useCart } from "@/lib/cart-store";
import { list } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 3.99;

function CartPage() {
  const navigate = useNavigate();
  const { lines, increment, decrement, removeItem, clear, closeCart } = useCart();

  useEffect(() => {
    closeCart();
  }, [closeCart]);

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const total = subtotal;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-[calc(3.75rem+env(safe-area-inset-top))] sm:pt-24 pb-52 sm:pb-16">
        <PageTransition>
          <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8 py-2 sm:py-6">
            {/* Top Title (Mobile) */}
            <div className="flex sm:hidden items-center gap-3 mb-4">
              <button
                onClick={() => navigate("/menu")}
                className="size-9 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Back to menu"
              >
                <ArrowLeft className="size-5" />
              </button>
              <h1 className="font-serif text-xl font-bold text-foreground">Your Cart</h1>
              <span className="ml-auto text-xs text-muted-foreground font-medium">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            {/* Top Title (Desktop) */}
            <div className="hidden sm:flex items-center justify-between border-b border-border/40 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/menu")}
                  className="size-9 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors"
                  aria-label="Back to menu"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <h1 className="font-serif text-3xl font-bold text-foreground">Your Cart</h1>
              </div>
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
                          to={`/product/${line.originalId || line.id}`}
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
                            to={`/product/${line.originalId || line.id}`}
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



                {/* Desktop Checkout Button (Hidden on Mobile) */}
                <div className="hidden sm:block pt-2">
                  <Button
                    onClick={() => navigate("/checkout")}
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

      {/* Sticky Bottom Floating Checkout Card for Mobile (Floating seamlessly above mobile bottom nav) */}
      {lines.length > 0 && (
        <div className="sm:hidden fixed bottom-[calc(max(0.75rem,env(safe-area-inset-bottom,0px))+4.75rem)] inset-x-3 z-30 pointer-events-none select-none">
          <div className="pointer-events-auto max-w-md mx-auto bg-card/90 dark:bg-card/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] ring-1 ring-white/30 dark:ring-white/5 shadow-[0_10px_35px_rgba(0,0,0,0.15)] rounded-2xl p-2.5 px-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Total ({itemCount} {itemCount === 1 ? "item" : "items"})
              </p>
              <p className="font-serif text-2xl font-bold text-foreground leading-tight">
                ${total.toFixed(2)}
              </p>
            </div>
            <Button
              onClick={() => navigate("/checkout")}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm shadow-md shadow-primary/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Checkout</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
