import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 🛠️ PWA SERVICE WORKER REGISTRATION
// This allows your app to work offline and handle background updates
import { registerSW } from 'virtual:pwa-register'

// Register the service worker automatically and update immediately
registerSW({ 
  immediate: true,
  onNeedRefresh() {
    console.log('New content available, please refresh.');
  },
  onOfflineReady() {
    console.log('App is ready to work offline!');
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)