import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UtensilsCrossed, Store, Search, ShoppingBag, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-store";
import { SearchModal } from "./search-modal";

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [customer, setCustomer] = useState(() => {
    try {
      const auth = localStorage.getItem("customerAuth");
      return auth ? JSON.parse(auth) : null;
    } catch (e) {
      return null;
    }
  });

  const count = useCart((s) => s.lines.reduce((acc, l) => acc + l.qty, 0));
  const openCart = useCart((s) => s.openCart);
  const closeCart = useCart((s) => s.closeCart);
  const isCartOpen = useCart((s) => s.isOpen);

  useEffect(() => {
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
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  // Hide on admin, driver, kitchen, login, and checkout/payment flow routes
  const hidePaths = ["/admin", "/driver", "/kitchen", "/login", "/checkout", "/payment", "/order-confirmation", "/track"];
  if (hidePaths.some((p) => location.pathname.startsWith(p))) {
    return null;
  }

  const isHome = location.pathname === "/";
  const isMenu = location.pathname.startsWith("/menu");
  const isCart = location.pathname === "/cart";
  const isProfile = location.pathname.startsWith("/profile");

  const handleTabClick = () => {
    closeCart();
    window.dispatchEvent(new Event("closeNavbarModals"));
  };

  return (
    <>
      <nav 
        className="fixed bottom-0 inset-x-0 z-[70] lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/60 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 px-2 shadow-2xl transition-all"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
          {/* 1. Home / Food */}
          <Link
            to="/"
            onClick={handleTabClick}
            className={`flex flex-col items-center justify-center gap-1 w-full py-1 rounded-xl transition-all ${
              isHome ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <motion.div whileTap={{ scale: 0.88 }} className="relative flex flex-col items-center">
              <UtensilsCrossed className={`size-5 transition-transform ${isHome ? "scale-110" : ""}`} />
              {isHome && (
                <motion.div 
                  layoutId="activeTabIndicator" 
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" 
                />
              )}
            </motion.div>
            <span className="text-[11px] leading-none tracking-tight">Food</span>
          </Link>

          {/* 2. Menu */}
          <Link
            to="/menu"
            onClick={handleTabClick}
            className={`flex flex-col items-center justify-center gap-1 w-full py-1 rounded-xl transition-all ${
              isMenu ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <motion.div whileTap={{ scale: 0.88 }} className="relative flex flex-col items-center">
              <Store className={`size-5 transition-transform ${isMenu ? "scale-110" : ""}`} />
              {isMenu && (
                <motion.div 
                  layoutId="activeTabIndicator" 
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" 
                />
              )}
            </motion.div>
            <span className="text-[11px] leading-none tracking-tight">Menu</span>
          </Link>

          {/* 3. Search */}
          <button
            type="button"
            onClick={() => {
              handleTabClick();
              window.scrollTo({ top: 0, behavior: "smooth" });
              window.dispatchEvent(new Event("focusNavbarSearch"));
            }}
            className="flex flex-col items-center justify-center gap-1 w-full py-1 rounded-xl text-muted-foreground hover:text-foreground font-medium transition-all cursor-pointer"
          >
            <motion.div whileTap={{ scale: 0.88 }} className="relative flex flex-col items-center">
              <Search className="size-5" />
            </motion.div>
            <span className="text-[11px] leading-none tracking-tight">Search</span>
          </button>

          {/* 4. Cart */}
          <Link
            to="/cart"
            onClick={handleTabClick}
            className={`flex flex-col items-center justify-center gap-1 w-full py-1 rounded-xl transition-all ${
              isCart ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <motion.div whileTap={{ scale: 0.88 }} className="relative flex flex-col items-center">
              <ShoppingBag className={`size-5 transition-transform ${isCart ? "scale-110" : ""}`} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
              {isCart && (
                <motion.div 
                  layoutId="activeTabIndicator" 
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" 
                />
              )}
            </motion.div>
            <span className="text-[11px] leading-none tracking-tight">Cart</span>
          </Link>

          {/* 5. Account / Profile */}
          <Link
            to={customer ? "/profile" : "/login"}
            onClick={handleTabClick}
            className={`flex flex-col items-center justify-center gap-1 w-full py-1 rounded-xl transition-all ${
              isProfile ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <motion.div whileTap={{ scale: 0.88 }} className="relative flex flex-col items-center">
              {customer?.avatar ? (
                <div className={`size-5.5 rounded-full overflow-hidden border ${isProfile ? "border-primary ring-2 ring-primary/30" : "border-border/60"}`}>
                  <img src={customer.avatar} alt="Account" className="size-full object-cover" />
                </div>
              ) : (
                <User className={`size-5 transition-transform ${isProfile ? "scale-110" : ""}`} />
              )}
              {isProfile && (
                <motion.div 
                  layoutId="activeTabIndicator" 
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" 
                />
              )}
            </motion.div>
            <span className="text-[11px] leading-none tracking-tight">Account</span>
          </Link>
        </div>
      </nav>

      <SearchModal isOpen={searchOpen} onClose={setSearchOpen} />
    </>
  );
}
