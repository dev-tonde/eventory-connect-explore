import React from "react";
import ReactDOM from "react-dom/client";

// Minimal App component for testing
function App() {
  console.log("App rendering successfully");
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Eventory - React Initialization Test</h1>
      <p>If you can see this, React is working correctly!</p>
      <button onClick={() => alert("React hooks are working!")}>
        Test Button
      </button>
    </div>
  );
}

// Ensure DOM is ready
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

console.log("Creating React root...");
const root = ReactDOM.createRoot(rootElement);

console.log("Rendering App...");
root.render(<App />);