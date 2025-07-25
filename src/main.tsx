import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/SimpleAuthContext";
import { LanguageProvider } from "./contexts/SimpleLanguageContext";
import App from "./App";

// Add immediate console logging
console.log("🚀 main.tsx loading...");
console.log("React version:", React.version);

// Test function to verify JavaScript is working
function testJS() {
  console.log("✅ JavaScript is working");
  return "JS OK";
}

// Minimal test component with hooks
function TestApp() {
  console.log("🔧 TestApp component rendering");
  
  // Test React hooks
  const [count, setCount] = React.useState(0);
  const [status, setStatus] = React.useState("React Loading...");

  React.useEffect(() => {
    console.log("✅ useEffect working");
    setStatus("React Hooks Working!");
  }, []);

  const handleClick = () => {
    console.log("🖱️ Button clicked");
    setCount(prev => prev + 1);
  };

  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      background: "white",
      borderRadius: "8px",
      marginTop: "50px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ color: "#22c55e" }}>✅ React Successfully Loaded!</h1>
      <div style={{ 
        padding: "10px", 
        background: "#f0f9ff", 
        border: "1px solid #0ea5e9",
        borderRadius: "4px",
        margin: "10px 0"
      }}>
        <strong>Status:</strong> {status}
      </div>
      <div style={{ 
        padding: "10px", 
        background: "#fefce8", 
        border: "1px solid #eab308",
        borderRadius: "4px",
        margin: "10px 0"
      }}>
        <strong>Test Counter:</strong> {count}
        <br />
        <button 
          onClick={handleClick}
          style={{
            padding: "8px 16px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "8px"
          }}
        >
          Test React Hooks (Click Me!)
        </button>
      </div>
      <div style={{ 
        padding: "10px", 
        background: "#f0fdf4", 
        border: "1px solid #22c55e",
        borderRadius: "4px",
        margin: "10px 0"
      }}>
        <strong>✅ All Systems Working:</strong>
        <ul>
          <li>JavaScript: {testJS()}</li>
          <li>React: {React.version}</li>
          <li>useState: Working</li>
          <li>useEffect: Working</li>
          <li>Event Handlers: Working</li>
        </ul>
      </div>
    </div>
  );
}

// Ensure DOM is ready
console.log("🔍 Looking for root element...");
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found!");
  throw new Error("Root element not found");
}

console.log("✅ Root element found");
console.log("🏗️ Creating React root...");

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log("✅ React root created successfully");
  
  // Create QueryClient
  console.log("🔧 Creating QueryClient...");
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
  console.log("✅ QueryClient created");
  
  console.log("🎨 Rendering with all providers...");
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
  console.log("✅ All providers + App rendered successfully");
} catch (error) {
  console.error("❌ Error during React initialization:", error);
  
  // Fallback error display
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial; background: #fee; border: 1px solid #f00; border-radius: 4px; margin: 20px;">
      <h2 style="color: #d00;">React Initialization Failed</h2>
      <p><strong>Error:</strong> ${error.message}</p>
      <p>Check browser console for details.</p>
    </div>
  `;
}