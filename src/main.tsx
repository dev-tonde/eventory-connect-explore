
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SecurityWrapper } from './components/security/SecurityWrapper.tsx'
import { setupPerformanceMonitoring } from './lib/monitoring.ts'

// Initialize performance monitoring
setupPerformanceMonitoring();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SecurityWrapper>
      <App />
    </SecurityWrapper>
  </React.StrictMode>,
)
