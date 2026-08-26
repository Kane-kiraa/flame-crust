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

  // Active order tracking is now rendered directly inside top navbar (navbar.jsx)
  return null;
}
