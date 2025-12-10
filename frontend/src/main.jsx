import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

export const serverurl = "http://localhost:5000"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)