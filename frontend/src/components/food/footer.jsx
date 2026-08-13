"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Flame, Instagram, Twitter, Facebook, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
const footerLinks = {
  Menu: ["Pizza", "Pizza Bagels", "Burgers", "Sides", "Drinks", "Desserts"],
  Company: ["Our story", "Careers", "Press", "Franchising", "Gift cards"],
  Support: ["Help center", "Track order", "Contact us", "Allergens", "FAQs"],
  Legal: ["Privacy", "Terms", "Cookies", "Accessibility"]
};
function Footer() {
  return /* @__PURE__ */ jsxs("footer", { className: "relative bg-background text-foreground overflow-hidden mt-auto pt-14 lg:pt-14 border-t border-border/60", children: [
    /* @__PURE__ */ jsx("div", { className: "hidden" }),
    /* @__PURE__ */ jsx("div", { className: "hidden" }),
    /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          className: "relative rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-8 lg:p-12 shadow-warm-lg",
          children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10 items-center", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight", children: "Hungry yet? Let's fix that." }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-white/85 text-base sm:text-lg max-w-lg", children: "Get exclusive deals, secret menu drops, and a free garlic knots on your first order over $20." })
            ] }),
            /* @__PURE__ */ jsxs(
              "form",
              {
                onSubmit: (e) => {
                  e.preventDefault();
                  toast.success("You&apos;re in! Check your inbox for the deal.");
                  e.target.reset();
                },
                className: "flex flex-col sm:flex-row gap-2",
                children: [
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "email",
                      required: true,
                      placeholder: "your@email.com",
                      className: "h-12 lg:h-13 rounded-full bg-card border-border text-foreground placeholder:text-muted-foreground"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      type: "submit",
                      size: "lg",
                      className: "h-12 lg:h-13 px-6 rounded-full bg-foreground text-background hover:bg-foreground/90 whitespace-nowrap",
                      children: [
                        "Subscribe",
                        /* @__PURE__ */ jsx(ArrowRight, { className: "size-4 ml-1" })
                      ]
                    }
                  )
                ]
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10 pt-12 lg:pt-16 pb-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-2 lg:col-span-2", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "flex items-center", children: /* @__PURE__ */ jsx("img", { src: "/images/library/logo.jpg", alt: "Flame & Crust logo", className: "h-20 w-40 object-contain" }) }),
          /* @__PURE__ */ jsx("p", { className: "mt-5 text-sm text-muted-foreground max-w-xs leading-relaxed", children: "Wood-fired pizzas, hand-rolled pizza bagels, and smashed Angus burgers. Crafted with care, delivered hot." }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 flex items-center gap-2", children: [Instagram, Twitter, Facebook].map((Icon, i) => /* @__PURE__ */ jsx(
            "a",
            {
              href: "#",
              className: "flex items-center justify-center size-10 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground/80 transition-colors",
              "aria-label": "Social link",
              children: /* @__PURE__ */ jsx(Icon, { className: "size-4.5" })
            },
            i
          )) })
        ] }),
        Object.entries(footerLinks).map(([title, links]) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-serif text-sm font-bold text-foreground uppercase tracking-wider mb-4", children: title }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2.5", children: links.map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "#",
              className: "text-sm text-muted-foreground hover:text-accent transition-colors",
              children: l
            }
          ) }, l)) })
        ] }, title))
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-3 gap-6 py-8 border-t border-border/60", children: [
        { icon: Phone, label: "Call us", value: "(855) 965-755-963" },
        { icon: Mail, label: "Email", value: "chanthakhemara12@gmail.com" },
        { icon: MapPin, label: "Visit", value: "142 Brick Lane, Eastside" }
      ].map((c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center size-10 rounded-full bg-secondary text-accent", children: /* @__PURE__ */ jsx(c.icon, { className: "size-4.5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: c.label }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-foreground/90", children: c.value })
        ] })
      ] }, c.label)) }),
      /* @__PURE__ */ jsxs("div", { className: "py-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "\xA9 ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " Flame & Crust Artisan Kitchen. All rights reserved."
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1.5", children: [
          "Made with ",
          /* @__PURE__ */ jsx(Flame, { className: "size-3.5 text-accent animate-flicker" }),
          " and a lot of dough."
        ] })
      ] })
    ] })
  ] });
}
export {
  Footer
};
