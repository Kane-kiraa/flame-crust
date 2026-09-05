import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, useSpring } from "framer-motion";

// Lazy / direct imports of the 4 main tab pages for instant mobile mounting
import Home from "@/pages/home.jsx";
import MenuPage from "@/pages/menu.jsx";
import CartPage from "@/pages/cart.jsx";
import ProfilePage from "@/pages/profile.jsx";

const TABS = [
  { id: "food", path: "/" },
  { id: "menu", path: "/menu" },
  { id: "cart", path: "/cart" },
  { id: "profile", path: "/profile" },
];

export function SwipeableTabsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [viewportWidth, setViewportWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return 390;
  });

  // Keep track of active tab index based on current URL pathname
  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.path === location.pathname)
  );

  // Responsive breakpoint listener
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
        setViewportWidth(containerRef.current?.offsetWidth || window.innerWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Spring physics for natural momentum and snapping
  const springConfig = { damping: 32, stiffness: 320, mass: 0.85 };
  const animatedX = useSpring(-activeIndex * viewportWidth, springConfig);

  // Sync position whenever active tab or viewport changes
  useEffect(() => {
    if (isMobile) {
      animatedX.set(-activeIndex * viewportWidth);
    }
  }, [activeIndex, viewportWidth, isMobile, animatedX]);

  // If on desktop (>= 768px), render standard route Outlet
  if (!isMobile) {
    return <Outlet />;
  }

  // Velocity & threshold based snapping for Telegram-style swipe feel
  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = viewportWidth * 0.2; // 20% swipe threshold

    let targetIndex = activeIndex;

    if (offset < -threshold || velocity < -450) {
      // Swiped left -> next tab
      targetIndex = Math.min(activeIndex + 1, TABS.length - 1);
    } else if (offset > threshold || velocity > 450) {
      // Swiped right -> previous tab
      targetIndex = Math.max(activeIndex - 1, 0);
    }

    animatedX.set(-targetIndex * viewportWidth);

    if (targetIndex !== activeIndex) {
      navigate(TABS[targetIndex].path, { replace: true });
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-dvh overflow-hidden relative bg-background"
    >
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{
          left: -(TABS.length - 1) * viewportWidth,
          right: 0,
        }}
        dragElastic={0.12} // Smooth elastic rubber-band feel at edge tabs
        onDragEnd={handleDragEnd}
        style={{ x: animatedX }}
        className="flex h-full w-full will-change-transform select-none"
      >
        {/* Tab 0: Food (Home) */}
        <div className="w-full shrink-0 h-full overflow-y-auto overscroll-y-contain [touch-action:pan-y] pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          <Home />
        </div>

        {/* Tab 1: Menu */}
        <div className="w-full shrink-0 h-full overflow-y-auto overscroll-y-contain [touch-action:pan-y] pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          <MenuPage />
        </div>

        {/* Tab 2: Cart */}
        <div className="w-full shrink-0 h-full overflow-y-auto overscroll-y-contain [touch-action:pan-y] pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          <CartPage />
        </div>

        {/* Tab 3: Account (Profile) */}
        <div className="w-full shrink-0 h-full overflow-y-auto overscroll-y-contain [touch-action:pan-y] pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          <ProfilePage />
        </div>
      </motion.div>
    </div>
  );
}

export default SwipeableTabsLayout;
