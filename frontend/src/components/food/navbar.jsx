"use client";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu as MenuIcon, X, Moon, Sun, User, MapPin, Ticket, LogOut, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider.jsx";
import { SearchModal } from "./search-modal";
import { fetchCategories } from "@/lib/food-api";


function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [customer, setCustomer] = useState(() => {
    try {
      const auth = localStorage.getItem("customerAuth");
      return auth ? JSON.parse(auth) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const adminAuth = localStorage.getItem("adminAuth");
      if (!adminAuth) return false;
      const a = JSON.parse(adminAuth);
      return (a.role || "").toUpperCase() === "ADMIN";
    } catch (e) {
      return false;
    }
  });
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const count = useCart((s) => s.lines.reduce((acc, l) => acc + l.qty, 0));
  const openCart = useCart((s) => s.openCart);

  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    const checkActiveOrder = async () => {
      try {
        const stored = localStorage.getItem("customerAuth");
        if (!stored) { setActiveOrder(null); return; }
        const c = JSON.parse(stored);
        const { list } = await import("@/lib/api");
        const orders = await list("orders");
        const active = orders
          .filter(o => String(o.customer_id) === String(c.id) && o.status !== "DELIVERED" && o.status !== "CANCELLED")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        setActiveOrder(active || null);
      } catch (e) {}
    };

    checkActiveOrder();
    const interval = setInterval(checkActiveOrder, 15000);
    window.addEventListener("orderPlaced", checkActiveOrder);
    window.addEventListener("authChanged", checkActiveOrder);
    return () => {
      clearInterval(interval);
      window.removeEventListener("orderPlaced", checkActiveOrder);
      window.removeEventListener("authChanged", checkActiveOrder);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    
    const handleAuthChange = () => {
      try {
        const auth = localStorage.getItem("customerAuth");
        const adminAuth = localStorage.getItem("adminAuth");
        const c = auth ? JSON.parse(auth) : null;
        setCustomer(c);
        if (adminAuth) {
          const a = JSON.parse(adminAuth);
          setIsAdmin((a.role || "").toUpperCase() === "ADMIN");
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        setCustomer(null);
        setIsAdmin(false);
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
    let active = true;
    fetchCategories()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const navLinks = [
    { label: "Menu", href: "/menu" },
    ...(categories.length > 0
      ? categories.map((c) => ({
          label: c.name,
          href: `/menu?category=${c.slug}`,
        }))
      : [
          { label: "Pizza", href: "/menu?category=pizza" },
          { label: "Pizza Bagels", href: "/menu?category=pizza-bagels" },
          { label: "Burgers", href: "/menu?category=burgers" },
          { label: "Sides", href: "/menu?category=sides" },
        ]),
  ];

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
        "fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b border-transparent pt-[env(safe-area-inset-top)]",
        mobileOpen
          ? "bg-background/90 backdrop-blur-2xl border-border/60 shadow-2xl"
          : "bg-transparent backdrop-blur-none"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-4">
          <div className="flex items-center justify-start shrink-0 gap-2">
            <Link to="/" className="flex items-center group" onClick={() => setMobileOpen(false)}>
              <img
                src="/images/library/logo.jpg"
                alt="Flame & Crust logo"
                className="h-10 sm:h-16 w-auto object-contain"
              />
            </Link>

            {/* Active Order Tracking Badge right inside Top Navbar */}
            {activeOrder && (
              <button
                type="button"
                onClick={() => navigate(`/track/${activeOrder.id}`)}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] sm:text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all shrink-0 cursor-pointer shadow-xs"
                title={`Order #${activeOrder.order_number} (${activeOrder.status})`}
              >
                <span className="relative flex size-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-green-500"></span>
                </span>
                <Clock className="size-3.5" />
                <span className="truncate max-w-[90px] sm:max-w-[150px]">
                  #{activeOrder.order_number}
                </span>
              </button>
            )}
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-1 flex-1 px-2 overflow-x-auto no-scrollbar scroll-smooth">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className={cn(
                  "px-3.5 py-2 text-sm font-semibold transition-colors duration-200 rounded-full border-2 border-transparent shrink-0 whitespace-nowrap",
                  isLinkActive(l)
                    ? "text-primary bg-primary/10 border-primary/20"
                    : "text-foreground/80 hover:text-primary hover:bg-secondary/60"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex size-10 sm:size-11 shrink-0 rounded-full text-foreground/70 hover:text-primary hover:bg-secondary/60 transition-colors"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="size-4 sm:size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex size-10 sm:size-11 shrink-0 rounded-full text-foreground/70 hover:text-primary"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="size-4 sm:size-5" /> : <Moon className="size-4 sm:size-5" />}
            </Button>

            {isAdmin && (
              <Button 
                variant="outline" 
                className="hidden md:inline-flex shrink-0 rounded-full border-primary/40 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary gap-1.5 px-3.5 h-11 font-semibold text-xs transition-all shadow-sm"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/admin/dashboard");
                }}
              >
                <LayoutDashboard className="size-4" />
                <span>Admin Dashboard</span>
              </Button>
            )}

            {customer ? (
              <button 
                type="button"
                className="hidden sm:flex shrink-0 items-center gap-2 p-0.5 rounded-full border border-border/60 hover:border-primary/60 bg-secondary/40 transition-all cursor-pointer"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/profile");
                }}
                aria-label="User Profile"
              >
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-primary/30">
                  {customer.avatar ? (
                    <img src={customer.avatar} alt="Profile" className="size-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="size-4 text-primary" />
                  )}
                </div>
                <span className="hidden md:inline text-xs font-semibold pr-2.5 truncate max-w-[100px]">{customer.name || customer.phone}</span>
              </button>
            ) : location.pathname !== "/login" ? (
              <Button 
                className="hidden sm:flex rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 sm:h-11 px-4 sm:px-6 font-semibold text-xs sm:text-sm transition-all shadow-warm"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/login");
                }}
              >
                Sign In
              </Button>
            ) : null}

            <div id="cart-icon-wrapper" className="hidden sm:flex relative items-center justify-center size-10 sm:size-11 shrink-0">
              <motion.button
                id="cart-icon"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={openCart}
                className="relative size-full aspect-square rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-warm flex items-center justify-center cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open cart"
              >
                <ShoppingBag className="size-4 sm:size-5" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 min-w-4 sm:min-w-5 h-4 sm:h-5 px-1 sm:px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-[11px] font-bold flex items-center justify-center ring-2 ring-background pointer-events-none"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden size-10 shrink-0 rounded-full text-foreground hover:bg-secondary/60"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-6" /> : <MenuIcon className="size-6" />}
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
              <div className="flex flex-col py-3 px-2 gap-1 max-h-[75vh] overflow-y-auto no-scrollbar">
                {/* Mobile User Card */}
                {customer && (
                  <div 
                    onClick={() => { setMobileOpen(false); navigate("/profile"); }}
                    className="p-3 mb-2 rounded-2xl bg-secondary/50 border border-border/60 flex items-center justify-between cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/40 shrink-0">
                        {customer.avatar ? (
                          <img src={customer.avatar} alt="Profile" className="size-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="size-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{customer.name || "Customer"}</p>
                        <p className="text-xs text-muted-foreground">{customer.phone || customer.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full text-xs text-primary font-semibold">
                      Settings
                    </Button>
                  </div>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-between mb-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="size-4 text-primary" />
                      <span>Admin Dashboard</span>
                    </div>
                    <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                      Backend
                    </span>
                  </Link>
                )}

                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-medium rounded-xl transition-colors",
                      isLinkActive(l)
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-foreground/80 hover:text-primary hover:bg-secondary/60"
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
                
                <div className="h-px bg-border/60 my-1 mx-4" />
                
                {/* Theme Switcher in Mobile Drawer */}
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl transition-colors text-foreground/80 hover:text-primary hover:bg-secondary/60 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {theme === "dark" ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-400" />}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{theme} mode</span>
                </button>

                {customer ? (
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium rounded-xl transition-colors text-foreground/80 hover:text-primary hover:bg-secondary/60 flex items-center gap-2"
                  >
                    <User className="size-4" />
                    Profile & Settings
                  </Link>
                ) : location.pathname !== "/login" ? (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium rounded-xl transition-colors text-foreground/80 hover:text-primary hover:bg-secondary/60 flex items-center gap-2"
                  >
                    Sign In
                  </Link>
                ) : null}
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
