import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useUIStore } from '@/store/uiStore'

// Load persisted theme before first render to avoid flash of wrong theme
useUIStore.getState().loadPreferences().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
