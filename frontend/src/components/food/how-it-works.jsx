"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Bike } from "lucide-react";
const steps = [
  {
    icon: Search,
    step: "01",
    title: "Pick your favorites",
    body: "Browse our menu of wood-fired pizzas, hand-rolled pizza bagels, smashed burgers, and shareable sides. Filter by mood, dietary needs, or just go with the bestsellers."
  },
  {
    icon: ShoppingBag,
    step: "02",
    title: "Build your order",
    body: "Add to cart, customize toppings, and watch your free-delivery progress bar fill up. Apply coupons, see live totals \u2014 no surprises at checkout."
  },
  {
    icon: Bike,
    step: "03",
    title: "We fire it up",
    body: "Your order hits the kitchen the moment you tap place. From oven to insulated hot-bag to your door in 25\u201335 minutes. Track it live in real time."
  }
];
function HowItWorks() {
  return /* @__PURE__ */ jsx("section", { className: "py-20 lg:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block rounded-full bg-secondary border border-border/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary uppercase tracking-wider", children: "How it works" }),
      /* @__PURE__ */ jsxs("h2", { className: "mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05]", children: [
        "Three taps and",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { className: "text-gradient-warm italic", children: "you're feasting." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-14 lg:mt-20 grid md:grid-cols-3 gap-6 lg:gap-8 relative", children: [
      /* @__PURE__ */ jsx("div", { className: "hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" }),
      steps.map((s, i) => /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: {
            duration: 0.55,
            delay: i * 0.15,
            ease: [0.16, 1, 0.3, 1]
          },
          className: "relative text-center",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "relative inline-flex items-center justify-center", children: [
              /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center size-24 rounded-full bg-card border border-border/60 shadow-warm", children: /* @__PURE__ */ jsx(s.icon, { className: "size-9 text-primary", strokeWidth: 1.7 }) }),
              /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 flex items-center justify-center size-9 rounded-full bg-accent text-accent-foreground font-serif text-sm font-bold border-2 border-background", children: s.step })
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "mt-5 font-serif text-xl sm:text-2xl font-bold text-foreground", children: s.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto", children: s.body })
          ]
        },
        s.title
      ))
    ] })
  ] }) });
}
export {
  HowItWorks
};
