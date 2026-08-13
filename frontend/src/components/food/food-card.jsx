"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Plus, Star, Flame, Leaf, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
function FoodCard({ item, index = 0 }) {
  const addItem = useCart((s) => s.addItem);
  const lines = useCart((s) => s.lines);
  const inCart = lines.find((l) => l.id === item.id);
  const handleAdd = () => {
    addItem(item);
    toast.success(`${item.name} added to cart`, {
      description: inCart ? `Now ${inCart.qty + 1} in your order` : "Tap the cart icon to checkout"
    });
  };
  return /* @__PURE__ */ jsxs(
    motion.article,
    {
      initial: { opacity: 0, y: 24 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-60px" },
      transition: {
        duration: 0.5,
        delay: Math.min(index * 0.06, 0.4),
        ease: [0.16, 1, 0.3, 1]
      },
      className: "group card-lift relative flex flex-col overflow-hidden rounded-3xl bg-card border border-border/60 shadow-warm hover:shadow-warm-lg",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/3] overflow-hidden", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: item.image,
              alt: item.name,
              className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
              loading: "lazy"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3 flex flex-wrap gap-1.5", children: item.tags.slice(0, 2).map((t) => /* @__PURE__ */ jsx(
            "span",
            {
              className: cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
                t.toLowerCase().includes("bestseller") || t.toLowerCase().includes("favorite") ? "bg-primary/90 text-primary-foreground" : "bg-background/85 text-foreground"
              ),
              children: t
            },
            t
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-md px-2 py-1 text-xs font-semibold text-foreground", children: [
            /* @__PURE__ */ jsx(Star, { className: "size-3 fill-accent text-accent" }),
            item.rating
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-3 flex gap-1.5", children: [
            item.spicy && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 rounded-full bg-primary/90 text-primary-foreground px-2 py-0.5 text-[10px] font-semibold uppercase", children: [
              /* @__PURE__ */ jsx(Flame, { className: "size-3" }),
              " Spicy"
            ] }),
            item.vegetarian && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 rounded-full bg-green-600/90 text-white px-2 py-0.5 text-[10px] font-semibold uppercase", children: [
              /* @__PURE__ */ jsx(Leaf, { className: "size-3" }),
              " Veg"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl font-bold text-foreground leading-tight", children: item.name }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground line-clamp-3 flex-1", children: item.description }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Price" }),
              /* @__PURE__ */ jsxs("span", { className: "font-serif text-2xl font-bold text-foreground", children: [
                "$",
                item.price.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: handleAdd,
                size: "lg",
                className: cn(
                  "h-12 px-5 rounded-full font-semibold shadow-warm transition-all group/btn",
                  inCart ? "bg-green-600 hover:bg-green-700 text-white" : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
                ),
                children: inCart ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Check, { className: "size-4" }),
                  /* @__PURE__ */ jsxs("span", { className: "ml-1", children: [
                    "In cart (",
                    inCart.qty,
                    ")"
                  ] })
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Plus, { className: "size-4 group-hover/btn:rotate-90 transition-transform" }),
                  /* @__PURE__ */ jsx("span", { className: "ml-1", children: "Add" })
                ] })
              }
            )
          ] })
        ] })
      ]
    }
  );
}
export {
  FoodCard
};
