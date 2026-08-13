"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
const testimonials = [
  {
    name: "Sarah K.",
    role: "Verified customer",
    initials: "SK",
    rating: 5,
    body: "I've ordered the Margherita Classica four times this month. The crust is the best I've had outside of Naples \u2014 airy, slightly charred, with that perfect chew. Delivery was hot every single time.",
    color: "bg-rose-500"
  },
  {
    name: "Marcus T.",
    role: "Burger devotee",
    initials: "MT",
    rating: 5,
    body: "The Flame & Crust Signature burger ruined every other burger for me. The bacon jam is criminally good and the patties are juicy without being greasy. Worth every penny.",
    color: "bg-amber-500"
  },
  {
    name: "Priya R.",
    role: "Pizza bagel convert",
    initials: "PR",
    rating: 5,
    body: "Didn't know pizza bagels could be this good. The everything-bagel crust is genius. Ordered a tray for a party and they disappeared in five minutes flat.",
    color: "bg-green-500"
  },
  {
    name: "David L.",
    role: "Weekly regular",
    initials: "DL",
    rating: 5,
    body: "Consistently excellent. I order every Friday night for family movie night and the kids lose their minds every time the box opens. The garlic knots are a must-order.",
    color: "bg-purple-500"
  },
  {
    name: "Jenna M.",
    role: "Food blogger",
    initials: "JM",
    rating: 5,
    body: "Reviewed 40+ pizzerias in the city this year \u2014 Flame & Crust is in my top three. The four-cheese with truffle honey is a religious experience. Highly recommend.",
    color: "bg-blue-500"
  },
  {
    name: "Tom H.",
    role: "Office lunch hero",
    initials: "TH",
    rating: 5,
    body: "Ordered 12 pizzas for a team lunch \u2014 arrived hot, on time, and everyone asked where it was from. The online ordering flow was the easiest I've used. 11/10.",
    color: "bg-orange-500"
  }
];
function Testimonials() {
  return /* @__PURE__ */ jsxs("section", { className: "py-20 lg:py-28 relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10 bg-background" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-block rounded-full bg-secondary border border-border/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary uppercase tracking-wider", children: "Loved by 30k+ foodies" }),
        /* @__PURE__ */ jsxs("h2", { className: "mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05]", children: [
          "Don't take our",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-gradient-warm italic", children: "word for it." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx(Star, { className: "size-5 fill-accent text-accent" }, i)) }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "4.9 / 5" }),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "\xB7 12,400+ reviews" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 lg:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6", children: testimonials.map((t, i) => /* @__PURE__ */ jsxs(
        motion.figure,
        {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: {
            duration: 0.5,
            delay: Math.min(i * 0.08, 0.4),
            ease: [0.16, 1, 0.3, 1]
          },
          className: "relative rounded-3xl bg-card border border-border/60 shadow-warm hover:shadow-warm-lg transition-shadow p-6 lg:p-7 flex flex-col",
          children: [
            /* @__PURE__ */ jsx(Quote, { className: "size-8 text-accent/30 mb-3" }),
            /* @__PURE__ */ jsx("blockquote", { className: "flex-1 text-sm sm:text-base text-foreground/80 leading-relaxed", children: t.body }),
            /* @__PURE__ */ jsxs("figcaption", { className: "mt-5 flex items-center gap-3 pt-5 border-t border-border/60", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `flex items-center justify-center size-11 rounded-full ${t.color} text-white font-semibold text-sm`,
                  children: t.initials
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground text-sm", children: t.name }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: t.role })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: Array.from({ length: t.rating }).map((_, s) => /* @__PURE__ */ jsx(
                Star,
                {
                  className: "size-3.5 fill-accent text-accent"
                },
                s
              )) })
            ] })
          ]
        },
        t.name
      )) })
    ] })
  ] });
}
export {
  Testimonials
};
