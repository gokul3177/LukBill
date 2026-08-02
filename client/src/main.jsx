import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Set default base URL for API requests
// In production, this points to the deployed backend.
// In development, it defaults to empty string, falling back to Vite's proxy.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

console.log("lukbill_2.0");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
