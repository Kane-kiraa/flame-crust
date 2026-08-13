"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { foodItems } from "@/lib/food-data";
import { fetchFoodItems } from "@/lib/food-api";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
function Featured() {
  const addItem = useCart((s) => s.addItem);
  const [featured, setFeatured] = useState(foodItems.filter((f) => f.popular).slice(0, 3));
  useEffect(() => {
    const controller = new AbortController();
    fetchFoodItems(controller.signal).then((items) => setFeatured(items.filter((item) => item.popular).slice(0, 3))).catch(() => void 0);
    return () => controller.abort();
  }, []);
  return /* @__PURE__ */ jsx("section", { className: "py-16 lg:py-20 relative overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-secondary border border-border/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary uppercase tracking-wider", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "size-3.5" }),
          "Trending this week"
        ] }),
        /* @__PURE__ */ jsxs("h2", { className: "mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.1]", children: [
          "The dishes our fans",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-gradient-warm italic", children: "can't stop ordering." })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          asChild: true,
          className: "self-start sm:self-auto rounded-full border-foreground/15 hover:border-foreground/30 hover:bg-secondary",
          children: /* @__PURE__ */ jsxs("a", { href: "#menu", className: "flex items-center gap-1", children: [
            "See full menu",
            /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-5 lg:gap-6", children: featured.map((item, i) => /* @__PURE__ */ jsxs(
      motion.article,
      {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: {
          duration: 0.55,
          delay: i * 0.1,
          ease: [0.16, 1, 0.3, 1]
        },
        className: "group relative overflow-hidden rounded-3xl bg-card border border-border/60 shadow-warm hover:shadow-warm-lg card-lift",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "relative aspect-[5/4] overflow-hidden", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: item.image,
                alt: item.name,
                className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
                loading: "lazy"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide", children: [
              /* @__PURE__ */ jsx(TrendingUp, { className: "size-3" }),
              "#",
              i + 1,
              " this week"
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-foreground", children: [
              /* @__PURE__ */ jsx(Star, { className: "size-3 fill-accent text-accent" }),
              item.rating
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-3 right-12", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-serif text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow", children: item.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-white/80 mt-1 line-clamp-1", children: item.description })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "From" }),
              /* @__PURE__ */ jsxs("div", { className: "font-serif text-2xl font-bold text-foreground", children: [
                "$",
                item.price.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => {
                  addItem(item);
                  toast.success(`${item.name} added to cart`);
                },
                className: "rounded-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground h-11 px-5 font-semibold shadow-warm",
                children: "Add to cart"
              }
            )
          ] })
        ]
      },
      item.id
    )) })
  ] }) });
}
export {
  Featured
};
