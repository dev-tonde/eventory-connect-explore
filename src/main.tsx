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

// Initialize customer support with secure config
const initializeServices = async () => {
  try {
    // Initialize Intercom - using production app ID
    initIntercom("oyvy9c86");

    // Initialize Termly - using actual embed ID from secrets
    initTermly("8fb23262-17cc-475b-b8ec-c96dc4c63b5b");
  } catch (error) {
    console.warn("Failed to initialize third-party services:", error);
  }
};

// Initialize services
initializeServices();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
