import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, Package, ChevronRight, X, ChefHat, Clock, CheckCircle2 } from "lucide-react";
import { list } from "@/lib/api";

export function ActiveOrderWidget() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const widgetRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    // Reset state when route changes
    setDismissed(false);
    setIsExpanded(false);
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
        const activeList = orders
          .filter(o => String(o.customer_id) === String(customer.id) && o.status !== "DELIVERED" && o.status !== "CANCELLED")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
        if (activeList.length > 0) {
          const allItems = await list("order_items");
          activeList.forEach(active => {
            active.items = allItems.filter(item => String(item.order_id) === String(active.id));
          });
        }
          
        setActiveOrders(activeList);
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

  if (activeOrders.length === 0 || dismissed) return null;

  // Don't show on any tracking page
  if (location.pathname.startsWith("/track/")) return null;

  const getIcon = (status) => {
    switch (status) {
      case "OUT_FOR_DELIVERY": return <Bike className="size-5 sm:size-6 animate-bounce" />;
      case "PREPARING": return <ChefHat className="size-5 sm:size-6 animate-pulse" />;
      case "PENDING": return <Clock className="size-5 sm:size-6 animate-pulse" />;
      case "CONFIRMED": return <CheckCircle2 className="size-5 sm:size-6" />;
      default: return <Package className="size-5 sm:size-6" />;
    }
  };

  const hasMultiple = activeOrders.length > 1;
  const primaryOrder = activeOrders[0];

  return (
    <AnimatePresence>
      <motion.div 
        ref={widgetRef}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: isExpanded ? -16 : "60%", opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        drag="x"
        dragConstraints={{ left: -16, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(e, info) => {
          if (info.offset.x < -10) setIsExpanded(true);
          else if (info.offset.x > 10) setIsExpanded(false);
        }}
        className={`fixed ${location.pathname.startsWith('/product/') ? 'bottom-24' : 'bottom-6'} sm:bottom-8 right-0 z-[100]`}
      >
        <div className="relative">
          <div 
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
              else if (!hasMultiple) navigate(`/track/${primaryOrder.id}`);
            }}
            className={`relative bg-primary text-primary-foreground shadow-warm-lg flex flex-col cursor-pointer hover:bg-primary/90 border-2 border-primary/50 ring-4 ring-primary/20 overflow-hidden transition-all duration-300 ${
              isExpanded 
                ? "rounded-l-[28px] rounded-r-none pl-3 sm:pl-4 pr-6 py-2 min-h-[56px] sm:min-h-[64px] w-[280px] sm:w-[320px]" 
                : "rounded-full h-14 sm:h-16 w-14 sm:w-16 justify-center items-start pl-[14px] sm:pl-[18px]"
            }`}
            title={hasMultiple ? `${activeOrders.length} Active Orders` : `Order #${primaryOrder.order_number} - ${primaryOrder.status}`}
          >
            {/* Status Indicator Dot */}
            <span className="absolute top-[8px] left-[10px] sm:top-[10px] sm:left-[14px] flex size-3 z-10 transition-all">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-3 bg-green-500 border border-primary"></span>
            </span>

            {!isExpanded ? (
              <div className="shrink-0 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                {hasMultiple ? <Package className="size-5 sm:size-6" /> : getIcon(primaryOrder.status)}
                {hasMultiple && (
                  <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-background text-foreground text-[10px] font-bold border border-border shadow-sm">
                    {activeOrders.length}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col w-full h-full gap-2 mt-1 animate-in fade-in duration-300 delay-100">
                {hasMultiple ? (
                  <>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wide opacity-90 pl-6 sm:pl-8 mb-1">
                      {activeOrders.length} Active Orders
                    </div>
                    {activeOrders.map(order => (
                      <div 
                        key={order.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/track/${order.id}`);
                        }}
                        className="flex items-center gap-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 p-2 rounded-xl transition-colors"
                      >
                        <div className="shrink-0 size-8 sm:size-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                          {getIcon(order.status)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide opacity-90">
                            #{order.order_number} - {order.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs sm:text-sm font-medium truncate">
                            {order.items && order.items.length > 0 
                              ? `${order.items.length} item${order.items.length > 1 ? 's' : ''} • ${order.items[0].product_name}...`
                              : `Total: $${Number(order.total).toFixed(2)}`
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex items-center gap-3 w-full h-full">
                    <div className="shrink-0 flex items-center justify-center">
                      {getIcon(primaryOrder.status)}
                    </div>
                    <div className="whitespace-nowrap flex flex-col justify-center overflow-hidden w-full">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide opacity-90">
                        {primaryOrder.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs sm:text-sm font-medium truncate w-full">
                        {primaryOrder.items && primaryOrder.items.length > 0 
                          ? `${primaryOrder.items.length} item${primaryOrder.items.length > 1 ? 's' : ''} • ${primaryOrder.items[0].product_name}${primaryOrder.items.length > 1 ? ', ...' : ''}`
                          : `Order #${primaryOrder.order_number}`
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className={`absolute -top-1 -left-1 bg-background text-foreground size-5 rounded-full flex items-center justify-center shadow-md border border-border hover:scale-110 transition-all z-10 ${isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}`}
            aria-label="Close"
          >
            <X className="size-2.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
