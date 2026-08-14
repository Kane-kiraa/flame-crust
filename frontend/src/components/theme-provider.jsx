import { createContext, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("flame-crust-theme") || defaultTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("flame-crust-theme", theme);
  }, [theme]);

  return jsx(ThemeContext.Provider, { value: { theme, setTheme }, children });
}

export function useTheme() {
  return useContext(ThemeContext);
}
