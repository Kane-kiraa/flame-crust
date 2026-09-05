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

    // Apply the theme change smoothly midway through the 360° pizza rotation
    setTimeout(() => {
      setThemeState(newTheme);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        localStorage.setItem("flame-crust-theme", newTheme);
      }
    }, 400);

    // Smoothly exit after the rotation completes and settles effortlessly
    setTimeout(() => {
      setIsTransitioning(false);
      setPendingTheme(null);
    }, 920);
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
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/35 dark:bg-black/55 pointer-events-none select-none"
          >
            {/* Minimalist Frosted iOS-style HUD Card - Hardware accelerated */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -6 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex flex-col items-center justify-center px-8 py-6 min-w-[145px] rounded-[28px] bg-card/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_65px_rgba(0,0,0,0.65)] transform-gpu"
            >
              {/* Subtle ambient glowing aura behind the spinning pizza */}
              <div className="absolute top-5 size-14 rounded-full bg-gradient-to-tr from-amber-500/25 to-orange-500/25 blur-xl -z-10 animate-pulse" />

              {/* Exactly ONE smooth 360° rotation with silky fluid curve */}
              <motion.div
                initial={{ rotate: 0, scale: 0.9 }}
                animate={{
                  rotate: 360,
                  scale: [0.9, 1.12, 1],
                }}
                transition={{
                  duration: 0.76,
                  ease: [0.25, 0.8, 0.25, 1],
                }}
                className="text-5xl drop-shadow-[0_10px_20px_rgba(249,115,22,0.35)] flex items-center justify-center transform-gpu"
              >
                🍕
              </motion.div>

              {/* Clean typography label */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center text-center mt-3 select-none"
              >
                <span className="text-sm font-bold tracking-tight text-foreground">
                  {isTargetDark ? "Dark Mode" : "Light Mode"}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground tracking-wide mt-0.5">
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
