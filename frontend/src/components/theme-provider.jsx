import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("flame-crust-theme") || defaultTheme;
    }
    return defaultTheme;
  });

  const applyTheme = (newTheme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    root.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("flame-crust-theme", newTheme);
    setThemeState(newTheme);

    setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 300);
  };

  const setTheme = (newTheme) => {
    if (newTheme === theme) return;

    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => {
        applyTheme(newTheme);
      });
    } else {
      applyTheme(newTheme);
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("flame-crust-theme", theme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
