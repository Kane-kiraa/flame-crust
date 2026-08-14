"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { foodItems, categoryMeta, categoryOrder } from "@/lib/food-data";
import { getProducts } from "@/lib/api";
import { FoodCard } from "./food-card";
import { cn } from "@/lib/utils";
function Menu() {
  const [active, setActive] = useState("pizza");
  const [itemsFromApi, setItemsFromApi] = useState(foodItems);
  useEffect(() => {
    let mounted = true;
    getProducts()
      .then((data) => {
         if (!mounted) return;
         setItemsFromApi(Array.isArray(data) ? data : (data.products || []));
      })
      .catch(() => void 0);
    return () => {
      mounted = false;
    };
  }, []);
  const items = itemsFromApi.filter((i) => i.category === active);
  const meta = categoryMeta[active];
  return /* @__PURE__ */ jsxs("section", { id: "menu", className: "py-20 lg:py-28 relative", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 bg-background" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-block rounded-full bg-secondary border border-border/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary uppercase tracking-wider", children: "Our Menu" }),
        /* @__PURE__ */ jsxs("h2", { className: "mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05]", children: [
          "Pick your ",
          /* @__PURE__ */ jsx("span", { className: "text-gradient-warm italic", children: "flavor" }),
          " of comfort"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-base sm:text-lg text-muted-foreground", children: "Every dish is made-to-order with the good stuff \u2014 no shortcuts, no freezers, no compromises." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 lg:mt-14 flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "inline-flex flex-wrap justify-center gap-1.5 p-1.5 rounded-full bg-secondary/70 border border-border/60 backdrop-blur max-w-full overflow-x-auto no-scrollbar", children: categoryOrder.map((cat) => {
        const m = categoryMeta[cat];
        const isActive = active === cat;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActive(cat),
            className: cn(
              "relative px-4 sm:px-6 h-11 sm:h-12 rounded-full text-sm sm:text-base font-semibold transition-colors whitespace-nowrap",
              isActive ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
            ),
            children: [
              isActive && /* @__PURE__ */ jsx(
                motion.span,
                {
                  layoutId: "menu-tab-pill",
                  className: "absolute inset-0 rounded-full bg-primary shadow-warm",
                  transition: { type: "spring", stiffness: 400, damping: 35 }
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "relative z-10 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-base", children: m.icon }),
                m.label
              ] })
            ]
          },
          cat
        );
      }) }) }),
      /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
        motion.p,
        {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -8 },
          transition: { duration: 0.25 },
          className: "mt-6 text-center text-sm sm:text-base text-muted-foreground italic",
          children: meta.description
        },
        active
      ) }),
      /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -8 },
          transition: { duration: 0.35 },
          className: "mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6",
          children: items.map((item, idx) => /* @__PURE__ */ jsx(FoodCard, { item, index: idx }, item.id))
        },
        active
      ) })
    ] })
  ] });
}
export {
  Menu
};
