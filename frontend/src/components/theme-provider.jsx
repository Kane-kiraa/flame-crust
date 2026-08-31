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
  const [transitionTheme, setTransitionTheme] = useState(theme);

  const setTheme = (newTheme) => {
    if (newTheme === theme || isTransitioning) return;
    
    // 1. Show the beautiful loading overlay
    setTransitionTheme(newTheme);
    setIsTransitioning(true);
    
    // 2. Wait for overlay to completely cover the screen (300ms)
    setTimeout(() => {
      // 3. Prevent uneven color changes by disabling all CSS transitions temporarily
      const css = document.createElement("style");
      css.appendChild(
        document.createTextNode(
          `* {
             -webkit-transition: none !important;
             transition: none !important;
           }`
        )
      );
      document.head.appendChild(css);

      // Apply the theme change to the DOM instantly (hidden behind the overlay)
      setThemeState(newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      localStorage.setItem("flame-crust-theme", newTheme);

      // Force a browser repaint so the theme applies evenly right now
      window.getComputedStyle(document.body).display;
      
      // Re-enable transitions slightly after the DOM has repainted
      setTimeout(() => {
        document.head.removeChild(css);
      }, 50);

      // 4. Keep the premium loading screen visible for a moment
      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }, 300);
  };

  useEffect(() => {
    // Initial mount only
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-xl ${transitionTheme === "dark" ? "bg-zinc-950/85" : "bg-white/85"}`}
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 1.5, ease: "linear" }, 
                scale: { repeat: Infinity, duration: 1, ease: "easeInOut" } 
              }}
              className="text-8xl mb-6 drop-shadow-[0_0_20px_rgba(255,152,0,0.4)]"
              style={{ display: "inline-block" }}
            >
              🍕
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <h2 className={`font-serif text-3xl font-bold tracking-tight ${transitionTheme === "dark" ? "text-white" : "text-zinc-900"}`}>
                Switching to {transitionTheme === "dark" ? "Dark Mode" : "Light Mode"}
              </h2>
              <p className={`text-sm font-medium ${transitionTheme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>
                Preparing a fresh UI...
              </p>
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
