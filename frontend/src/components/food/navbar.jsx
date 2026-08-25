"use client";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu as MenuIcon, X, Moon, Sun, User, MapPin, Ticket, LogOut, ShieldCheck, LayoutDashboard, Clock, Package, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const [activeOrders, setActiveOrders] = useState([]);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  useEffect(() => {
    const checkActiveOrders = async () => {
      try {
        const stored = localStorage.getItem("customerAuth");
        if (!stored) { setActiveOrders([]); return; }
        const c = JSON.parse(stored);
        const { list } = await import("@/lib/api");
        const orders = await list("orders");
        const activeList = orders
          .filter(o => String(o.customer_id) === String(c.id) && o.status !== "DELIVERED" && o.status !== "CANCELLED")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setActiveOrders(activeList);
      } catch (e) {
        setActiveOrders([]);
      }
    };

    checkActiveOrders();
    const interval = setInterval(checkActiveOrders, 15000);
    window.addEventListener("orderPlaced", checkActiveOrders);
    window.addEventListener("authChanged", checkActiveOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener("orderPlaced", checkActiveOrders);
      window.removeEventListener("authChanged", checkActiveOrders);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { getProducts } = await import("@/lib/api");
        const data = await getProducts();
        setAllProducts(Array.isArray(data) ? data : (data.products || []));
      } catch (e) {}
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const handleFocusSearch = () => {
      setSearchFocused(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    };
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleFocusSearch();
      }
      if (e.key === "Escape") {
        setSearchFocused(false);
      }
    };
    window.addEventListener("focusNavbarSearch", handleFocusSearch);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("focusNavbarSearch", handleFocusSearch);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = searchQuery.trim().length > 0
    ? allProducts.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' && p.tags ? p.tags.split(',').map(s => s.trim()) : [])).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

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

            {/* 1 Active Order Badge */}
            {activeOrders.length === 1 && (
              <button
                type="button"
                onClick={() => navigate(`/track/${activeOrders[0].id}`)}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] sm:text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all shrink-0 cursor-pointer shadow-xs"
                title={`Order #${activeOrders[0].order_number} (${activeOrders[0].status})`}
              >
                <span className="relative flex size-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-green-500"></span>
                </span>
                <Clock className="size-3.5" />
                <span className="truncate max-w-[90px] sm:max-w-[150px]">
                  #{activeOrders[0].order_number}
                </span>
              </button>
            )}

            {/* Multiple Active Orders Badge */}
            {activeOrders.length > 1 && (
              <button
                type="button"
                onClick={() => setOrdersModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] sm:text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all shrink-0 cursor-pointer shadow-xs"
                title="View All Active Orders"
              >
                <span className="relative flex size-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-green-500"></span>
                </span>
                <Package className="size-3.5" />
                <span>{activeOrders.length} Orders</span>
              </button>
            )}
          </div>

          {/* Centered Top Navbar Search Input */}
          <div ref={searchContainerRef} className="flex-1 max-w-[170px] xs:max-w-xs sm:max-w-md mx-1.5 sm:mx-4 relative">
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-full bg-secondary/80 border transition-all ${
              searchFocused ? "border-primary ring-2 ring-primary/20 bg-background shadow-md" : "border-border/60 hover:border-primary/50"
            }`}>
              <Search className="size-3.5 sm:size-4 text-primary shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizza, burgers..."
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none border-none p-0"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground shrink-0 p-0.5"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <span className="hidden sm:inline-block text-[10px] bg-background/80 px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground font-mono">
                  ⌘K
                </span>
              )}
            </div>

            {/* Dropdown Search Results */}
            <AnimatePresence>
              {searchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-2xl border border-border/60 p-2 sm:p-3 max-h-[60vh] overflow-y-auto z-50 flex flex-col gap-1.5 min-w-[260px] sm:min-w-[340px]"
                >
                  {searchQuery.trim().length === 0 ? (
                    <div className="p-3 text-center">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Popular Searches</p>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {["Pepperoni", "Margherita", "Burgers", "Bagels", "Spicy"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="px-2.5 py-1 rounded-full bg-secondary text-[11px] font-semibold hover:bg-primary/10 hover:text-primary border border-border/40 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No items found for "{searchQuery}"
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery("");
                          navigate(`/product/${product.id}`);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/70 cursor-pointer transition-colors"
                      >
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="size-10 sm:size-12 rounded-lg object-cover bg-secondary shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-foreground truncate">{product.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{product.description}</p>
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-primary shrink-0">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-1 shrink-0 overflow-x-auto no-scrollbar scroll-smooth">
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
      {/* Active Orders List Modal */}
      <Dialog open={ordersModalOpen} onOpenChange={setOrdersModalOpen}>
        <DialogContent className="max-w-md w-[92vw] rounded-3xl p-5 border-border/60">
          <DialogHeader className="pb-3 border-b border-border/60">
            <DialogTitle className="font-serif text-xl font-bold flex items-center gap-2">
              <Package className="size-5 text-primary" /> Active Orders ({activeOrders.length})
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2 max-h-[60vh] overflow-y-auto no-scrollbar">
            {activeOrders.map((order) => (
              <div 
                key={order.id} 
                className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col gap-2.5 hover:bg-secondary/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">Order #{order.order_number}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">${Number(order.total).toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Time: {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <Button 
                  size="sm" 
                  className="rounded-full w-full mt-1 bg-primary text-primary-foreground font-semibold gap-1.5 h-9"
                  onClick={() => {
                    setOrdersModalOpen(false);
                    navigate(`/track/${order.id}`);
                  }}
                >
                  <Bike className="size-4" /> Track Order Status
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <SearchModal isOpen={searchOpen} onClose={setSearchOpen} />
    </header>
  );
}

export { Navbar };
