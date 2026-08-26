"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Instagram, Twitter, Facebook, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchCategories } from "@/lib/food-api";

function Footer({ hideNewsletter = false }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  const footerLinks = {
    Menu: categories.length > 0
      ? categories.map((c) => ({ label: c.name, to: `/menu?category=${c.slug}` }))
      : [
          { label: "Pizza", to: "/menu?category=pizza" },
          { label: "Pizza Bagels", to: "/menu?category=pizza-bagels" },
          { label: "Burgers", to: "/menu?category=burgers" },
          { label: "Sides", to: "/menu?category=sides" },
        ],
    Company: [
      { label: "Our story", to: "/#features" },
      { label: "Careers", to: "#" },
      { label: "Press", to: "#" },
      { label: "Franchising", to: "#" },
      { label: "Gift cards", to: "#" },
    ],
    Support: [
      { label: "Help center", to: "#" },
      { label: "Track order", to: "#" },
      { label: "Contact us", to: "#" },
      { label: "Allergens", to: "#" },
      { label: "FAQs", to: "#" },
    ],
    Legal: [
      { label: "Privacy", to: "#" },
      { label: "Terms", to: "#" },
      { label: "Cookies", to: "#" },
      { label: "Accessibility", to: "#" },
    ],
  };

  return (
    <footer className="relative bg-background text-foreground overflow-hidden mt-auto pt-10 lg:pt-14 pb-20 lg:pb-0 border-t border-border/60">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!hideNewsletter && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-8 lg:p-12 shadow-warm-lg"
          >
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10 items-center">
              <div>
                <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Hungry yet? Let's fix that.
                </h3>
                <p className="mt-3 text-white/85 text-base sm:text-lg max-w-lg">
                  Get exclusive deals, secret menu drops, and a free garlic knots on your first order over $20.
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("You're in! Check your inbox for the deal.");
                  e.target.reset();
                }}
                className="flex flex-col sm:flex-row gap-2"
              >
                <Input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="h-12 lg:h-13 rounded-full bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 lg:h-13 px-6 rounded-full bg-foreground text-background hover:bg-foreground/90 whitespace-nowrap"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10 pt-10 pb-12">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center">
              <img
                src="/images/library/logo.jpg"
                alt="Flame & Crust logo"
                className="h-20 w-40 object-contain"
              />
            </Link>
            <p className="mt-5 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Wood-fired pizzas, hand-rolled pizza bagels, and smashed Angus burgers. Crafted with care, delivered hot.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Instagram,].map((Icon, i) => (
                <a
                  key={i}
                  href="https://www.facebook.com/share/193HJWpF4T/?mibextid=wwXIfr"
                  className="flex items-center justify-center size-10 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground/80 transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
              {[Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="https://www.facebook.com/share/193HJWpF4T/?mibextid=wwXIfr"
                  className="flex items-center justify-center size-10 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground/80 transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
              {[Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="https://www.facebook.com/share/193HJWpF4T/?mibextid=wwXIfr"
                  className="flex items-center justify-center size-10 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground/80 transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-serif text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-6 py-8 border-t border-border/60">
          {[
            { icon: Phone, label: "Call us", value: "(855) 965-755-963" },
            { icon: Mail, label: "Email", value: "chanthakhemara12@gmail.com" },
            { icon: MapPin, label: "Visit", value: "142 Brick Lane, Eastside" }
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <span className="flex items-center justify-center size-10 rounded-full bg-secondary text-accent">
                <c.icon className="size-4.5" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  {c.label}
                </div>
                <div className="text-sm font-medium text-foreground/90">{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="py-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Flame & Crust Artisan Kitchen. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Flame className="size-3.5 text-accent animate-flicker" /> and a lot of dough.
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
