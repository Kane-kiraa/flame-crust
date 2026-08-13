"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Flame, Star, Truck, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
const stats = [
  { value: "4.9", label: "Avg rating", icon: Star },
  { value: "25min", label: "Delivery", icon: Clock },
  { value: "30k+", label: "Orders served", icon: Truck }
];
function Hero() {
  return /* @__PURE__ */ jsxs("section", { className: "relative pt-28 sm:pt-32 lg:pt-40 pb-16 lg:pb-24 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 -z-10", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-background" }),
        /* @__PURE__ */ jsx("div", { className: "hidden" }),
        /* @__PURE__ */ jsx("div", { className: "hidden" }),
        /* @__PURE__ */ jsx("div", { className: "hidden" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          className: "text-center lg:text-left",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-secondary/80 border border-border/60 pl-1.5 pr-4 py-1.5 text-xs sm:text-sm font-medium text-foreground/80 backdrop-blur", children: [
              /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(Flame, { className: "size-3.5" }) }),
              /* @__PURE__ */ jsx("span", { children: "Wood-fired since 2014" }),
              /* @__PURE__ */ jsx(Sparkles, { className: "size-3.5 text-accent" })
            ] }),
            /* @__PURE__ */ jsxs("h1", { className: "mt-6 font-serif font-bold tracking-tight text-foreground text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95]", children: [
              "Cravings,",
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsxs("span", { className: "relative inline-block", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gradient-warm", children: "delivered hot" }),
                /* @__PURE__ */ jsx(
                  "svg",
                  {
                    viewBox: "0 0 320 18",
                    className: "absolute -bottom-2 left-0 w-full h-3 text-primary/40",
                    preserveAspectRatio: "none",
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        d: "M2 12 Q 80 2, 160 10 T 318 8",
                        stroke: "currentColor",
                        strokeWidth: "3",
                        fill: "none",
                        strokeLinecap: "round"
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "italic font-medium text-foreground/90", children: "in 25 min." })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed", children: "Wood-fired sourdough pizzas, hand-rolled pizza bagels, and smashed Angus burgers \u2014 crafted by chefs who actually care, and delivered to your door before the cheese stops bubbling." }),
            /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "lg",
                  asChild: true,
                  className: "h-13 sm:h-14 px-7 sm:px-8 text-base rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm group",
                  children: /* @__PURE__ */ jsxs("a", { href: "#menu", className: "flex items-center gap-2", children: [
                    "Order now",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "size-5 group-hover:translate-x-1 transition-transform" })
                  ] })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "lg",
                  variant: "outline",
                  asChild: true,
                  className: "h-13 sm:h-14 px-7 sm:px-8 text-base rounded-full bg-background/60 backdrop-blur border-foreground/15 hover:border-foreground/30 hover:bg-secondary",
                  children: /* @__PURE__ */ jsx("a", { href: "#features", children: "See what's cooking" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-12 grid grid-cols-3 gap-4 sm:gap-6 max-w-md mx-auto lg:mx-0", children: stats.map((s, i) => /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5, delay: 0.5 + i * 0.1 },
                className: "text-center lg:text-left",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center lg:justify-start gap-1.5 mb-1", children: [
                    /* @__PURE__ */ jsx(s.icon, { className: "size-4 text-accent fill-accent" }),
                    /* @__PURE__ */ jsx("span", { className: "font-serif text-2xl sm:text-3xl font-bold text-foreground", children: s.value })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs sm:text-sm text-muted-foreground font-medium", children: s.label })
                ]
              },
              s.label
            )) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
          className: "relative aspect-square max-w-xl mx-auto w-full",
          children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "size-[90%] rounded-full border-2 border-dashed border-primary/20 animate-slow-spin" }) }),
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                animate: { y: [0, -10, 0] },
                transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                className: "absolute inset-2 sm:inset-4 rounded-full overflow-hidden shadow-warm-lg ring-4 ring-background",
                children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: "/images/library/pizza.jpg",
                      alt: "Signature wood-fired pepperoni pizza",
                      className: "w-full h-full object-cover",
                      loading: "eager"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.5 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.7, type: "spring", stiffness: 200 },
                className: "absolute -top-2 left-2 sm:-left-4 bg-background rounded-2xl shadow-warm-lg p-3 sm:p-4 border border-border/60 rotate-[-6deg]",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 text-accent", children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx(Star, { className: "size-3 sm:size-4 fill-accent" }, i)) }),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs sm:text-sm font-semibold text-foreground", children: "12,400+ reviews" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.5 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.9, type: "spring", stiffness: 200 },
                className: "absolute bottom-6 -right-2 sm:-right-4 bg-foreground text-background rounded-2xl shadow-warm-lg p-3 sm:p-4 rotate-[5deg]",
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center size-8 sm:size-9 rounded-full bg-accent text-accent-foreground", children: /* @__PURE__ */ jsx(Truck, { className: "size-4 sm:size-5" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] sm:text-xs uppercase tracking-wide opacity-70", children: "Free delivery" }),
                    /* @__PURE__ */ jsx("div", { className: "text-sm sm:text-base font-semibold", children: "over $25" })
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.5 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 1.1, type: "spring", stiffness: 200 },
                className: "absolute top-1/2 -translate-y-1/2 -left-2 sm:-left-6 size-14 sm:size-16 rounded-2xl bg-primary text-primary-foreground shadow-warm-lg flex flex-col items-center justify-center rotate-[-8deg]",
                children: [
                  /* @__PURE__ */ jsx(Flame, { className: "size-6 sm:size-7 animate-flicker" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] sm:text-[10px] font-bold uppercase mt-0.5", children: "Hot" })
                ]
              }
            )
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-16 lg:mt-24 border-y border-border/60 bg-secondary/40 py-3 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "flex animate-marquee whitespace-nowrap", children: Array.from({ length: 2 }).map((_, dup) => /* @__PURE__ */ jsx("div", { className: "flex items-center gap-8 px-4", children: [
      "\u{1F355} Wood-fired sourdough crust",
      "\u{1F96F} Hand-rolled pizza bagels",
      "\u{1F354} Smashed Angus burgers",
      "\u{1F33F} Locally sourced produce",
      "\u{1F680} 25-minute delivery",
      "\u{1F468}\u200D\u{1F373} Chef-crafted recipes",
      "\u{1F525} Baked fresh to order"
    ].map((item) => /* @__PURE__ */ jsx(
      "span",
      {
        className: "text-sm sm:text-base font-medium text-foreground/70",
        children: item
      },
      item + dup
    )) }, dup)) }) })
  ] });
}
export {
  Hero
};
