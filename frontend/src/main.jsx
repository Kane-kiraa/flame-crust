import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider.jsx";
import App from "./App.jsx";
import "./app/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes("mockclientid")) {
  console.error("🚨 VITE_GOOGLE_CLIENT_ID is missing from .env or Vite hasn't picked it up yet. Google Login will fail with a 400 error. Please restart your dev server.");
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "1234567890-mockclientid.apps.googleusercontent.com"}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
