"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Flame, Leaf, Timer, Truck, Award, ChefHat } from "lucide-react";
const features = [
  {
    icon: Flame,
    title: "Wood-fired oven",
    body: "Our 800\xB0F brick oven chars the crust in 90 seconds for that perfect leopard-spot finish and airy chew.",
    color: "bg-orange-500/10 text-orange-600"
  },
  {
    icon: Leaf,
    title: "Locally sourced",
    body: "Produce from regional farms, mozzarella from a 3rd-generation cheesemaker, no artificial anything. Ever.",
    color: "bg-green-500/10 text-green-600"
  },
  {
    icon: Timer,
    title: "Made to order",
    body: "Nothing pre-cooked, nothing reheated. Your pizza hits the oven the moment you tap place order.",
    color: "bg-amber-500/10 text-amber-600"
  },
  {
    icon: Truck,
    title: "25-min delivery",
    body: "Insulated hot-bags and live GPS tracking. If it's late, your next order is on us \u2014 that's a promise.",
    color: "bg-rose-500/10 text-rose-600"
  },
  {
    icon: ChefHat,
    title: "Chef-crafted",
    body: "Recipes by award-winning chefs. We spent 2 years dialing in the dough. You'll taste the difference.",
    color: "bg-purple-500/10 text-purple-600"
  },
  {
    icon: Award,
    title: "Best in town",
    body: "Voted #1 pizzeria by City Eats three years running. We're just getting warmed up.",
    color: "bg-blue-500/10 text-blue-600"
  }
];
function Features() {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "features",
      className: "py-20 lg:py-28 relative isolate overflow-hidden bg-background text-foreground",
      children: [
        /* @__PURE__ */ jsx("div", { className: "hidden" }),
        /* @__PURE__ */ jsx("div", { className: "hidden" }),
        /* @__PURE__ */ jsx("div", {
        className: "relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", {
          className: "grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-start", children: [
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 24 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: "-80px" },
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              className: "lg:sticky lg:top-28",
              children: [
                /* @__PURE__ */ jsx("span", { className: "inline-block rounded-full bg-secondary border border-border/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-accent uppercase tracking-wider", children: "Why Flame & Crust" }),
                /* @__PURE__ */ jsxs("h2", {
                className: "mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-foreground", children: [
                  "We sweat the",
                  /* @__PURE__ */ jsx("br", {}),
                  /* @__PURE__ */ jsx("span", { className: "text-accent italic", children: "little things" }),
                  /* @__PURE__ */ jsx("br", {}),
                  "so you don't",
                  /* @__PURE__ */ jsx("br", {}),
                  "have to."
                ]
              }),
                /* @__PURE__ */ jsx("p", { className: "mt-5 text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed", children: "From a 48-hour dough fermentation to a smidge of honey on the pepperoni \u2014 every detail is intentional. That's the difference between food and an experience." }),
                /* @__PURE__ */ jsxs("div", {
                className: "mt-8 relative rounded-3xl overflow-hidden aspect-[4/3] shadow-warm-lg ring-1 ring-border/60", children: [
                  /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: "/images/library/pizza3.1.jpg",
                    alt: "Wood-fired pizza oven at Flame & Crust",
                    className: "w-full h-full object-cover",
                    loading: "lazy"
                  }
                ),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" }),
                  /* @__PURE__ */ jsxs("div", {
                  className: "absolute bottom-4 left-4 right-4", children: [
                    /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-2 text-white", children: [
                      /* @__PURE__ */ jsx(Flame, { className: "size-5 text-accent animate-flicker" }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest opacity-80", children: "Now firing" })
                    ]
                  }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 font-serif text-lg sm:text-xl font-semibold text-white", children: "Margherita Classica, fresh out the oven" })
                  ]
                })
                ]
              })
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", {
            className: "grid sm:grid-cols-2 gap-3 sm:gap-5", children: features.map((f, i) => /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 24 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: "-60px" },
                transition: {
                  duration: 0.5,
                  delay: Math.min(i * 0.08, 0.4),
                  ease: [0.16, 1, 0.3, 1]
                },
                className: "group relative rounded-2xl sm:rounded-3xl bg-card border border-border/60 hover:border-primary/30 p-4 sm:p-6 lg:p-7 transition-all hover:bg-card",
                children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `inline-flex items-center justify-center size-9 sm:size-12 rounded-xl sm:rounded-2xl ${f.color} mb-2 sm:mb-4`,
                    children: /* @__PURE__ */ jsx(f.icon, { className: "size-4 sm:size-6" })
                  }
                ),
                /* @__PURE__ */ jsx("h3", { className: "font-serif text-base sm:text-xl font-bold text-card-foreground leading-tight", children: f.title }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 sm:mt-2 text-xs sm:text-base text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none", children: f.body })
                ]
              },
              f.title
            ))
          })
          ]
        })
      })
      ]
    }
  );
}
export {
  Features
};
