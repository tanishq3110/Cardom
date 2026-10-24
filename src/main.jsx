import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/globals.css'

// When deployed under /admin on the main domain (cardom-three.vercel.app/admin),
// BrowserRouter uses basename so all routes are relative to /admin.
// We detect whether we're running under /admin or at root (local dev) automatically.
const isSubPath = window.location.pathname.startsWith('/admin')
const basename = isSubPath ? '/admin' : '/'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
