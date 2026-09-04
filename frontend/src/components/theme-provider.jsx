import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Sun, Moon, Flame } from "lucide-react";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("flame-crust-theme") || defaultTheme;
    }
    return defaultTheme;
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetTheme, setTargetTheme] = useState(theme);

  const setTheme = (newTheme) => {
    if (newTheme === theme || isTransitioning) return;
    setTargetTheme(newTheme);
    setIsTransitioning(true);

    // Apply theme change slightly before overlay finishes for seamless visual sync
    setTimeout(() => {
      setThemeState(newTheme);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        localStorage.setItem("flame-crust-theme", newTheme);
      }
    }, 250);

    // Close transition quickly and smoothly
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
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
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center backdrop-blur-2xl px-6 select-none ${
              targetTheme === "dark"
                ? "bg-zinc-950/80 text-zinc-100"
                : "bg-white/80 text-zinc-900"
            }`}
          >
            {/* Ambient Background Glow Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.8, 1.2, 1], opacity: [0.3, 0.6, 0.4] }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`w-96 h-96 rounded-full blur-[100px] ${
                  targetTheme === "dark"
                    ? "bg-gradient-to-tr from-orange-600/30 via-red-600/20 to-purple-600/30"
                    : "bg-gradient-to-tr from-amber-400/35 via-orange-400/25 to-rose-300/30"
                }`}
              />
            </div>

            {/* Center Content Card */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative flex flex-col items-center text-center z-10 max-w-xs"
            >
              {/* Pizza & Aura Animation Container */}
              <div className="relative mb-6 flex items-center justify-center">
                {/* Glowing Aura Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 opacity-40 blur-md"
                />

                {/* Glass Badge Circle */}
                <div className={`relative w-28 h-28 rounded-3xl p-1 flex items-center justify-center shadow-2xl border backdrop-blur-xl ${
                  targetTheme === "dark"
                    ? "bg-zinc-900/90 border-zinc-700/50 shadow-orange-950/40"
                    : "bg-white/90 border-amber-200/60 shadow-orange-500/10"
                }`}>
                  {/* 3D Floating Pizza Emoji */}
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                      rotate: [0, 8, -8, 0],
                      scale: [1, 1.08, 1]
                    }}
                    transition={{
                      duration: 0.7,
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                    className="text-6xl drop-shadow-[0_10px_20px_rgba(239,68,68,0.35)] cursor-default select-none"
                  >
                    🍕
                  </motion.div>

                  {/* Mode Indicator Mini Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring" }}
                    className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg border backdrop-blur-md flex items-center justify-center ${
                      targetTheme === "dark"
                        ? "bg-zinc-800 border-zinc-700 text-amber-400"
                        : "bg-amber-500 border-amber-400 text-white"
                    }`}
                  >
                    {targetTheme === "dark" ? (
                      <Moon className="w-4 h-4 fill-amber-400" />
                    ) : (
                      <Sun className="w-4 h-4 animate-spin-slow" />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Title & Description with Luxurious Typography */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-1.5"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm border mb-1 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400">
                  <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
                  <span>Flame & Crust</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight font-sans">
                  {targetTheme === "dark" ? (
                    <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
                      Midnight Flame Mode
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-orange-600 via-red-500 to-amber-600 bg-clip-text text-transparent">
                      Golden Daylight Mode
                    </span>
                  )}
                </h2>

                <p className={`text-xs font-medium ${targetTheme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}>
                  {targetTheme === "dark" ? "Crafting your cozy dark ambiance..." : "Brightening up your crust experience..."}
                </p>
              </motion.div>

              {/* Glowing Shimmer Progress Bar */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                className="mt-6 w-44 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative shadow-inner"
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full bg-gradient-to-r from-transparent via-orange-500 to-amber-400 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                />
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

