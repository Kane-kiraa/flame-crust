import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

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

    // Apply theme change smoothly midway through the 360° rotation
    setTimeout(() => {
      setThemeState(newTheme);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        localStorage.setItem("flame-crust-theme", newTheme);
      }
    }, 360);

    // Smoothly exit after the rotation completes and settles
    setTimeout(() => {
      setIsTransitioning(false);
    }, 850);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("flame-crust-theme", theme);
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-md bg-black/25 dark:bg-black/45 pointer-events-none select-none"
          >
            {/* Minimalist Frosted iOS-style HUD Card */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -6 }}
              transition={{
                type: "spring",
                damping: 24,
                stiffness: 260,
                mass: 0.8,
              }}
              className="relative flex flex-col items-center justify-center px-7 py-5 min-w-[136px] rounded-[26px] bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_20px_48px_rgba(0,0,0,0.16)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.55)]"
            >
              {/* Exactly ONE smooth 360° rotation with iOS fluid spring curve */}
              <motion.div
                initial={{ rotate: 0, scale: 0.88 }}
                animate={{
                  rotate: 360,
                  scale: [0.88, 1.12, 1],
                }}
                transition={{
                  duration: 0.72,
                  ease: [0.32, 0.72, 0, 1],
                }}
                className="text-5xl drop-shadow-[0_8px_16px_rgba(249,115,22,0.3)] flex items-center justify-center"
              >
                🍕
              </motion.div>

              {/* iOS-style clean typography label below */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.32, ease: "easeOut" }}
                className="flex flex-col items-center text-center mt-2.5 select-none"
              >
                <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {isTargetDark ? "Dark Mode" : "Light Mode"}
                </span>
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wide mt-0.5">
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

