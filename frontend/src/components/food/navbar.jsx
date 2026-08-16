"use client";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu as MenuIcon, X, Moon, Sun, User, MapPin, Ticket, LogOut } from "lucide-react";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [customer, setCustomer] = useState(() => {
    try {
      const auth = localStorage.getItem("customerAuth");
      return auth ? JSON.parse(auth) : null;
    } catch (e) {
      return null;
    }
  });
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const count = useCart((s) => s.lines.reduce((acc, l) => acc + l.qty, 0));
  const openCart = useCart((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    
    const handleAuthChange = () => {
      try {
        const auth = localStorage.getItem("customerAuth");
        setCustomer(auth ? JSON.parse(auth) : null);
      } catch (e) {
        setCustomer(null);
      }
    };
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const isLinkActive = (l) => {
    if (!location.pathname.startsWith("/menu")) return false;

    const searchParams = new URLSearchParams(location.search);
    const currentCategory = searchParams.get("category") || "all";

    const linkCategory = l.href.includes("?category=")
      ? new URLSearchParams(l.href.split("?")[1]).get("category")
      : "all";

    return currentCategory === linkCategory;
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b border-transparent",
        scrolled || mobileOpen
          ? "bg-background/85 backdrop-blur-xl border-border/60 shadow-warm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 py-3 gap-2 sm:gap-4">
          <div className="flex items-center justify-start shrink-0">
            <Link to="/" className="flex items-center group" onClick={() => setMobileOpen(false)}>
              <img
                src="/images/library/logo.jpg"
                alt="Flame & Crust logo"
                className="h-14 sm:h-16 w-32 sm:w-36 object-contain"
              />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-1 flex-1 px-2">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className={cn(
                  "px-3.5 py-2 text-sm font-semibold transition-colors duration-200 rounded-full border-2 border-transparent shrink-0",
                  isLinkActive(l)
                    ? "text-primary bg-primary/10 border-primary/20"
                    : "text-foreground/80 hover:text-primary hover:bg-secondary/60"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-11 shrink-0 rounded-full text-foreground/70 hover:text-primary hover:bg-secondary/60 transition-colors"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-11 shrink-0 rounded-full text-foreground/70 hover:text-primary"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>

            {customer ? (
              <Button 
                variant="outline" 
                className="hidden sm:flex shrink-0 rounded-full border-border/60 hover:border-primary gap-2 pl-2 pr-4 h-11 bg-secondary/50"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/profile");
                }}
              >
                <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                  {customer.avatar ? (
                    <img src={customer.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="size-4 text-primary" />
                  )}
                </div>
                <span className="text-sm font-semibold truncate max-w-[110px]">{customer.name || customer.phone}</span>
              </Button>
            ) : (
              <Button 
                className="hidden sm:flex shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 font-semibold transition-all shadow-warm"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/login");
                }}
              >
                Sign In
              </Button>
            )}

            <motion.button
              id="cart-icon"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={openCart}
              className="relative size-11 aspect-square shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-warm flex items-center justify-center cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open cart"
            >
              <ShoppingBag className="size-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center ring-2 ring-background pointer-events-none"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden size-11 shrink-0 rounded-full"
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
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t border-border/60"
            >
              <div className="flex flex-col py-3 gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-4 py-3 text-base font-medium rounded-xl transition-colors",
                      isLinkActive(l)
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-foreground/80 hover:text-primary hover:bg-secondary/60"
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
                
                <div className="h-px bg-border/60 my-2 mx-4" />
                
                {customer ? (
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-base font-medium rounded-xl transition-colors text-foreground/80 hover:text-primary hover:bg-secondary/60 flex items-center gap-2"
                  >
                    <User className="size-5" />
                    Profile & Settings
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-base font-medium rounded-xl transition-colors text-foreground/80 hover:text-primary hover:bg-secondary/60 flex items-center gap-2"
                  >
                    Sign In
                  </Link>
                )}
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
