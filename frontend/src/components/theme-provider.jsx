import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

// Custom Vector Wood-Fired Pizza SVG Component for Ultra-Crisp Rendering
function PizzaIcon({ className = "size-20" }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Crust Gradient */}
        <radialGradient id="crustGradient" cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="#D97706" />
          <stop offset="92%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
        {/* Tomato Sauce & Melted Cheese Gradient */}
        <radialGradient id="cheeseGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#FDE047" />
          <stop offset="75%" stopColor="#F59E0B" />
          <stop offset="92%" stopColor="#DC2626" />
        </radialGradient>
        {/* Pepperoni Gradient */}
        <radialGradient id="pepperoniGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="70%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>
        {/* Soft Drop Shadow */}
        <filter id="pizzaShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.35" floodColor="#000000" />
        </filter>
      </defs>

      {/* Main Pizza Body */}
      <g filter="url(#pizzaShadow)">
        {/* Outer Crust Ring */}
        <circle cx="60" cy="60" r="54" fill="url(#crustGradient)" />
        {/* Charred Crust Spots */}
        <circle cx="28" cy="22" r="2.5" fill="#451A03" opacity="0.6" />
        <circle cx="95" cy="40" r="2" fill="#451A03" opacity="0.6" />
        <circle cx="85" cy="98" r="3" fill="#451A03" opacity="0.5" />
        <circle cx="24" cy="80" r="2" fill="#451A03" opacity="0.6" />
        <circle cx="62" cy="8" r="2.8" fill="#451A03" opacity="0.7" />

        {/* Golden Bubbling Cheese & Sauce Base */}
        <circle cx="60" cy="60" r="46" fill="url(#cheeseGradient)" />

        {/* Slice Cut Dividing Lines (subtle wood-fired score marks) */}
        <line x1="60" y1="14" x2="60" y2="106" stroke="#B45309" strokeWidth="1.2" opacity="0.4" strokeDasharray="3 2" />
        <line x1="14" y1="60" x2="106" y2="60" stroke="#B45309" strokeWidth="1.2" opacity="0.4" strokeDasharray="3 2" />
        <line x1="27" y1="27" x2="93" y2="93" stroke="#B45309" strokeWidth="1.2" opacity="0.4" strokeDasharray="3 2" />
        <line x1="93" y1="27" x2="27" y2="93" stroke="#B45309" strokeWidth="1.2" opacity="0.4" strokeDasharray="3 2" />

        {/* Juicy Pepperoni Slices */}
        <g>
          {/* Top Pepperoni */}
          <circle cx="60" cy="34" r="9" fill="url(#pepperoniGrad)" stroke="#991B1B" strokeWidth="0.8" />
          <circle cx="58" cy="32" r="1.5" fill="#FEF2F2" opacity="0.4" />
          <circle cx="62" cy="36" r="1" fill="#450A0A" opacity="0.5" />

          {/* Right Pepperoni */}
          <circle cx="82" cy="52" r="8.5" fill="url(#pepperoniGrad)" stroke="#991B1B" strokeWidth="0.8" />
          <circle cx="80" cy="50" r="1.5" fill="#FEF2F2" opacity="0.4" />

          {/* Bottom Right Pepperoni */}
          <circle cx="74" cy="78" r="9" fill="url(#pepperoniGrad)" stroke="#991B1B" strokeWidth="0.8" />
          <circle cx="72" cy="76" r="1.5" fill="#FEF2F2" opacity="0.4" />

          {/* Bottom Left Pepperoni */}
          <circle cx="44" cy="78" r="8.5" fill="url(#pepperoniGrad)" stroke="#991B1B" strokeWidth="0.8" />
          <circle cx="42" cy="76" r="1.5" fill="#FEF2F2" opacity="0.4" />

          {/* Left Pepperoni */}
          <circle cx="36" cy="50" r="9" fill="url(#pepperoniGrad)" stroke="#991B1B" strokeWidth="0.8" />
          <circle cx="34" cy="48" r="1.5" fill="#FEF2F2" opacity="0.4" />

          {/* Center Pepperoni */}
          <circle cx="58" cy="58" r="9.5" fill="url(#pepperoniGrad)" stroke="#991B1B" strokeWidth="0.8" />
          <circle cx="56" cy="56" r="1.8" fill="#FEF2F2" opacity="0.5" />
          <circle cx="61" cy="61" r="1.2" fill="#450A0A" opacity="0.6" />
        </g>

        {/* Fresh Green Basil / Herb Flecks */}
        <path d="M48 38 C47 35, 52 34, 50 39 Z" fill="#16A34A" />
        <path d="M72 40 C75 38, 76 43, 71 42 Z" fill="#15803D" />
        <path d="M68 68 C66 65, 71 64, 69 69 Z" fill="#16A34A" />
        <path d="M48 62 C46 59, 51 58, 49 63 Z" fill="#15803D" />
        <path d="M58 88 C60 85, 63 87, 59 89 Z" fill="#16A34A" />
        <circle cx="42" cy="32" r="1" fill="#15803D" />
        <circle cx="80" cy="68" r="1" fill="#16A34A" />
      </g>
    </svg>
  );
}

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("flame-crust-theme") || defaultTheme;
    }
    return defaultTheme;
  });
  const [pendingTheme, setPendingTheme] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setTheme = (newTheme) => {
    if (newTheme === theme || isTransitioning) return;
    setPendingTheme(newTheme);
    setIsTransitioning(true);

    // Apply the theme change smoothly midway through the slow gentle rotation (at 650ms)
    setTimeout(() => {
      setThemeState(newTheme);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        localStorage.setItem("flame-crust-theme", newTheme);
      }
    }, 650);

    // Conclude the slow, elegant loading animation gracefully (at 1450ms)
    setTimeout(() => {
      setIsTransitioning(false);
      setPendingTheme(null);
    }, 1450);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("flame-crust-theme", theme);
    }
  }, []);

  const isTargetDark = (pendingTheme || theme) === "dark";

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            // Clean semi-transparent overlay WITHOUT any background blur
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 dark:bg-black/60 pointer-events-none select-none"
          >
            {/* Elegant Clean Center Container - NO BLUR, Crisp & Fast */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -10 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center justify-center px-8 py-7 rounded-[32px] bg-zinc-900/90 dark:bg-zinc-950/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.5)] transform-gpu min-w-[170px]"
            >
              {/* Ultra-Smooth, Slow, Gentle 360° Pizza Rotation */}
              <motion.div
                initial={{ rotate: 0, scale: 0.92 }}
                animate={{
                  rotate: 360,
                  scale: [0.92, 1.06, 1],
                }}
                transition={{
                  duration: 1.35, // Slow, peaceful, and deliberate rotation
                  ease: [0.25, 1, 0.5, 1], // Smooth organic deceleration
                }}
                className="flex items-center justify-center transform-gpu"
              >
                <PizzaIcon className="size-24 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]" />
              </motion.div>

              {/* Clean Typography Label */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center text-center mt-4 select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-extrabold tracking-tight text-white">
                    {isTargetDark ? "Dark Mode" : "Light Mode"}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase mt-1">
                  {isTargetDark ? "រាត្រី • Midnight" : "ពន្លឺ • Daylight"}
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
