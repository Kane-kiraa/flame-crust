"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu as MenuIcon, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider.jsx";
const navLinks = [
  { label: "Pizza", href: "#menu" },
  { label: "Pizza Bagels", href: "#menu" },
  { label: "Burgers", href: "#menu" },
  { label: "Sides", href: "#menu" },
  { label: "Our Story", href: "#features" },
  { label: "Dashboard", href: "#dashboard" }
];
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const count = useCart((s) => s.lines.reduce((acc, l) => acc + l.qty, 0));
  const openCart = useCart((s) => s.openCart);
  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsx(
    "header",
    {
      className: cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-500",
        scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-warm" : "bg-transparent"
      ),
      children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex h-18 sm:h-20 items-center justify-between py-3", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "flex items-center group", children: /* @__PURE__ */ jsx("img", { src: "/images/library/logo.jpg", alt: "Flame & Crust logo", className: "h-14 sm:h-16 w-32 sm:w-36 object-contain" }) }),
          /* @__PURE__ */ jsx("nav", { className: "hidden lg:flex items-center gap-1", children: navLinks.map((l) => /* @__PURE__ */ jsx(
            "a",
            {
              href: l.href,
              className: "px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-secondary/60",
              children: l.label
            },
            l.label
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "size-11 rounded-full text-foreground/70 hover:text-primary",
                onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
                "aria-label": theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
                title: theme === "dark" ? "Light mode" : "Dark mode",
                children: mounted && theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "size-5" }) : /* @__PURE__ */ jsx(Moon, { className: "size-5" })
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "hidden sm:inline-flex text-foreground/70 hover:text-primary",
                asChild: true,
                children: /* @__PURE__ */ jsx("a", { href: "#menu", children: "Order Now" })
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: openCart,
                size: "icon",
                className: "relative size-11 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-warm",
                "aria-label": "Open cart",
                children: [
                  /* @__PURE__ */ jsx(ShoppingCart, { className: "size-5" }),
                  /* @__PURE__ */ jsx(AnimatePresence, { children: mounted && count > 0 && /* @__PURE__ */ jsx(
                    motion.span,
                    {
                      initial: { scale: 0, opacity: 0 },
                      animate: { scale: 1, opacity: 1 },
                      exit: { scale: 0, opacity: 0 },
                      transition: { type: "spring", stiffness: 500, damping: 25 },
                      className: "absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center ring-2 ring-background",
                      children: count
                    }
                  ) })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "lg:hidden size-11 rounded-full",
                onClick: () => setMobileOpen((s) => !s),
                "aria-label": "Toggle menu",
                children: mobileOpen ? /* @__PURE__ */ jsx(X, { className: "size-5" }) : /* @__PURE__ */ jsx(MenuIcon, { className: "size-5" })
              }
            )
          ] }),
        ] }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: mobileOpen && /* @__PURE__ */ jsx(
          motion.nav,
          {
            initial: { height: 0, opacity: 0 },
            animate: { height: "auto", opacity: 1 },
            exit: { height: 0, opacity: 0 },
            transition: { duration: 0.3 },
            className: "lg:hidden overflow-hidden border-t border-border/60",
            children: /* @__PURE__ */ jsx("div", { className: "flex flex-col py-3 gap-1", children: navLinks.map((l) => /* @__PURE__ */ jsx(
              "a",
              {
                href: l.href,
                onClick: () => setMobileOpen(false),
                className: "px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-secondary/60 rounded-xl",
                children: l.label
              },
              l.label
            )) })
          }
        ) })
      ] })
    }
  );
}
export {
  Navbar
};
