"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export function FlyToCart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handleFly = (e) => {
      const { image, startRect } = e.detail;
      const newItem = { id: Date.now() + Math.random(), image, startRect };
      setItems((prev) => [...prev, newItem]);

      // Trigger cart icon pop animation
      const cartIcon = document.getElementById("cart-icon");
      if (cartIcon) {
        setTimeout(() => {
          cartIcon.style.transform = "scale(1.2)";
          setTimeout(() => {
            cartIcon.style.transform = "scale(1)";
          }, 150);
        }, 950); // Trigger when item reaches it
      }

      // Remove after animation completes
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== newItem.id));
      }, 1200);
    };

    window.addEventListener("fly-to-cart", handleFly);
    return () => window.removeEventListener("fly-to-cart", handleFly);
  }, []);

  if (items.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <AnimatePresence>
        {items.map((item) => {
          const cartIcon = document.getElementById("cart-icon");
          // Fallback if cart icon is not found
          const endRect = cartIcon 
            ? cartIcon.getBoundingClientRect() 
            : { top: 20, left: window.innerWidth - 60, width: 44, height: 44 };
          
          const cx = item.startRect.left + item.startRect.width / 2;
          const cy = item.startRect.top + item.startRect.height / 2;
          const midSize = Math.min(item.startRect.width, item.startRect.height) * 0.8;
          const midTop = cy - midSize / 2;
          const midLeft = cx - midSize / 2;

          const endTop = endRect.top + endRect.height / 2 - midSize / 2;
          const endLeft = endRect.left + endRect.width / 2 - midSize / 2;

          return (
            <motion.div
              key={item.id}
              initial={{ 
                opacity: 0.8, 
                top: item.startRect.top, 
                left: item.startRect.left,
                width: item.startRect.width,
                height: item.startRect.height,
                borderRadius: "16px",
                scale: 1
              }}
              animate={{ 
                opacity: [0.8, 1, 1, 0],
                top: [item.startRect.top, midTop, endTop, endTop],
                left: [item.startRect.left, midLeft, endLeft, endLeft],
                width: [item.startRect.width, midSize, midSize, midSize],
                height: [item.startRect.height, midSize, midSize, midSize],
                scale: [1, 1, 0.2, 0.1],
                borderRadius: ["16px", "50%", "50%", "50%"]
              }}
              transition={{ duration: 1.1, times: [0, 0.35, 0.9, 1], ease: "easeInOut" }}
              className="absolute overflow-hidden shadow-2xl border-4 border-primary bg-background"
            >
              <img src={item.image} alt="" className="w-full h-full object-cover" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
