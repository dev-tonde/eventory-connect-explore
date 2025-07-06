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

// Initialize customer support
initIntercom("your-intercom-app-id"); // Replace with your actual Intercom App ID

// Initialize legal compliance
initTermly("your-termly-embed-id"); // Replace with your actual Termly Embed ID

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
