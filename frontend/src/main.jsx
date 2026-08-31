import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider.jsx";
import App from "./App.jsx";
import "./app/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      // Check for SW updates every 15 minutes
      setInterval(() => {
        registration.update();
      }, 15 * 60 * 1000);

      // Check for updates when user switches back to the app
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          registration.update();
        }
      });
    }
  }
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "55635804125-pvsg464061vkl6n8rrb32bfu2f5c1t9e.apps.googleusercontent.com";

// Disable iOS/PWA swipe-to-navigate gestures from the edges of the screen
document.addEventListener("touchstart", (e) => {
  const x = e.touches[0].pageX;
  // If touch starts within 25px of the left or right edge, block it
  if (x < 25 || x > window.innerWidth - 25) {
    e.preventDefault();
  }
}, { passive: false });

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
