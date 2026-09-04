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
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setTheme = (newTheme) => {
    if (newTheme === theme || isTransitioning) return;
    setIsTransitioning(true);

    // Apply theme change smoothly
    setTimeout(() => {
      setThemeState(newTheme);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        localStorage.setItem("flame-crust-theme", newTheme);
      }
    }, 180);

    // Complete transition smoothly & quickly
    setTimeout(() => {
      setIsTransitioning(false);
    }, 550);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("flame-crust-theme", theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-md bg-black/25 dark:bg-black/45 pointer-events-none select-none"
          >
            {/* Minimalist Floating Frosted Glass Card with Spinning Pizza */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)]"
            >
              {/* Smooth Spinning Pizza */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                className="text-5xl drop-shadow-[0_8px_16px_rgba(249,115,22,0.35)] flex items-center justify-center"
              >
                🍕
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

