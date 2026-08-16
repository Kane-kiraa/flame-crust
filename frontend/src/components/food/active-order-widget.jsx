import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, Package, ChevronRight, X, ChefHat, Clock, CheckCircle2 } from "lucide-react";
import { list } from "@/lib/api";

export function ActiveOrderWidget() {
  const [activeOrder, setActiveOrder] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Reset dismissed state when route changes
    setDismissed(false);
  }, [location.pathname]);

  useEffect(() => {
    // Don't show on admin or driver pages
    if (location.pathname.includes("/admin") || location.pathname.includes("/driver")) {
      return;
    }

    const checkActiveOrder = async () => {
      try {
        const stored = localStorage.getItem("customerAuth");
        if (!stored) return;
        const customer = JSON.parse(stored);
        
        const orders = await list("orders");
        const active = orders
          .filter(o => String(o.customer_id) === String(customer.id) && o.status !== "DELIVERED" && o.status !== "CANCELLED")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]; // Get most recent active
          
        setActiveOrder(active || null);
      } catch(e) {}
    };

    checkActiveOrder();
    const interval = setInterval(checkActiveOrder, 15000); // Check every 15s
    
    // Listen for custom event
    const handleOrderPlaced = () => {
      setDismissed(false);
      checkActiveOrder();
    };

    window.addEventListener("storage", checkActiveOrder);
    window.addEventListener("orderPlaced", handleOrderPlaced);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkActiveOrder);
      window.removeEventListener("orderPlaced", handleOrderPlaced);
    };
  }, [location.pathname]);

  if (!activeOrder || dismissed) return null;

  // Don't show on the tracking page for this specific order
  if (location.pathname === `/track/${activeOrder.id}`) return null;

  const getIcon = (status) => {
    switch (status) {
      case "OUT_FOR_DELIVERY": return <Bike className="size-5 sm:size-6 animate-bounce" />;
      case "PREPARING": return <ChefHat className="size-5 sm:size-6 animate-pulse" />;
      case "PENDING": return <Clock className="size-5 sm:size-6 animate-pulse" />;
      case "CONFIRMED": return <CheckCircle2 className="size-5 sm:size-6" />;
      default: return <Package className="size-5 sm:size-6" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`fixed ${location.pathname.startsWith('/product/') ? 'bottom-24' : 'bottom-6'} sm:bottom-8 right-4 sm:right-8 z-[100]`}
      >
        <div 
          onClick={() => navigate(`/track/${activeOrder.id}`)}
          className="relative size-14 sm:size-16 bg-primary text-primary-foreground rounded-full shadow-warm-lg flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-all duration-300 hover:scale-105 border-2 border-primary/50 ring-4 ring-primary/20 group"
          title={`Order #${activeOrder.order_number} - ${activeOrder.status}`}
        >
          {getIcon(activeOrder.status)}
          
          {/* Status Indicator Dot */}
          <span className="absolute top-0 right-0 flex size-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-3.5 bg-green-500 border-2 border-background"></span>
          </span>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="absolute -top-1 -left-1 bg-background text-foreground size-5 rounded-full flex items-center justify-center shadow-md border border-border hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 sm:opacity-100"
            aria-label="Close"
          >
            <X className="size-2.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
