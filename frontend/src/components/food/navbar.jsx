"use client";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu as MenuIcon, X, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider.jsx";
import { SearchModal } from "./search-modal";

const navLinks = [
  { label: "Menu", href: "/menu" },
  { label: "Pizza", href: "/menu?category=pizza" },
  { label: "Pizza Bagels", href: "/menu?category=pizza-bagels" },
  { label: "Burgers", href: "/menu?category=burgers" },
  { label: "Sides", href: "/menu?category=sides" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customer, setCustomer] = useState(null);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const count = useCart((s) => s.lines.reduce((acc, l) => acc + l.qty, 0));
  const openCart = useCart((s) => s.openCart);

  useEffect(() => {
    setMounted(true);
    const auth = localStorage.getItem("customerAuth");
    if (auth) {
      try {
        setCustomer(JSON.parse(auth));
      } catch (e) {}
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-500",
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-warm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 sm:h-20 items-center justify-between py-3">
          <Link to="/" className="flex items-center group">
            <img
              src="/images/library/logo.jpg"
              alt="Flame & Crust logo"
              className="h-14 sm:h-16 w-32 sm:w-36 object-contain"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors rounded-full",
                  location.pathname === l.href || (l.href !== "/" && location.pathname.startsWith(l.href.split("?")[0]))
                    ? "text-primary bg-primary/10"
                    : "text-foreground/80 hover:text-primary hover:bg-secondary/60"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-11 rounded-full text-foreground/70 hover:text-primary"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-11 rounded-full text-foreground/70 hover:text-primary"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {mounted && theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>

            {customer ? (
              <Button 
                variant="outline" 
                className="hidden sm:flex rounded-full border-border/60 hover:border-primary gap-2 pl-2 pr-4 h-11 ml-2 bg-secondary/50"
                onClick={() => navigate("/profile")}
              >
                <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  {customer.avatar ? (
                    <img src={customer.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="size-4 text-primary" />
                  )}
                </div>
                <span className="text-sm font-semibold truncate max-w-[100px]">{customer.name || customer.phone}</span>
              </Button>
            ) : (
              <Button 
                className="hidden sm:flex rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ml-2 h-11 px-6 font-semibold transition-all shadow-warm"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            )}

            <Button
              onClick={openCart}
              size="icon"
              className="relative size-11 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-warm"
              aria-label="Open cart"
            >
              <ShoppingBag className="size-5" />
              <AnimatePresence>
                {mounted && count > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center ring-2 ring-background"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden size-11 rounded-full"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-border/60"
            >
              <div className="flex flex-col py-3 gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    className={cn(
                      "px-4 py-3 text-base font-medium rounded-xl transition-colors",
                      location.pathname === l.href
                        ? "text-primary bg-primary/10"
                        : "text-foreground/80 hover:text-primary hover:bg-secondary/60"
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
      <SearchModal isOpen={searchOpen} onClose={setSearchOpen} />
    </header>
  );
}

export { Navbar };
