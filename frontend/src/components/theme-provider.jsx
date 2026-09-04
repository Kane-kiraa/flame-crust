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

    // Apply theme change exactly midway through the 360° rotation
    setTimeout(() => {
      setThemeState(newTheme);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        localStorage.setItem("flame-crust-theme", newTheme);
      }
    }, 240);

    // Fade out right as the single 360° spin finishes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 520);
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
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-md bg-black/20 dark:bg-black/40 pointer-events-none select-none"
          >
            {/* Minimalist Frosted Card */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)]"
            >
              {/* Exactly ONE smooth 360° rotation that flips the theme */}
              <motion.div
                initial={{ rotate: 0, scale: 0.8 }}
                animate={{ 
                  rotate: 360, 
                  scale: [0.8, 1.15, 1] 
                }}
                transition={{ 
                  duration: 0.48, 
                  ease: [0.4, 0, 0.2, 1] 
                }}
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

