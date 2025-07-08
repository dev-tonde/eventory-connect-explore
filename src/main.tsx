import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { SecurityWrapper } from "./components/security/SecurityWrapper";
import { setupPerformanceMonitoring } from "./lib/monitoring";
import { initSentry } from "./lib/sentry";
import { initIntercom } from "./lib/intercom";
import { initTermly } from "./lib/termly";

// Initialize error tracking
initSentry();

// Initialize performance monitoring
setupPerformanceMonitoring();

// Initialize customer support - TODO: Add INTERCOM_APP_ID to Supabase secrets
// initIntercom("PLACEHOLDER"); // Will be replaced with actual ID from Supabase secrets

// Initialize legal compliance - TODO: Add TERMLY_EMBED_ID to Supabase secrets  
// initTermly("PLACEHOLDER"); // Will be replaced with actual ID from Supabase secrets

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SecurityWrapper>
      <App />
    </SecurityWrapper>
  </React.StrictMode>
);
