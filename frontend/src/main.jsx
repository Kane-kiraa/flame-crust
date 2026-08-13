import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/theme-provider.jsx";
import App from "./App.jsx";
import "./app/globals.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
