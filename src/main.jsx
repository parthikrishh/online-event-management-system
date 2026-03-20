import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initStorage } from './utils/storage'
import { initializeRealtimeUpdates } from './services/apiService'

// Initialize default events and users in localStorage
initStorage()
initializeRealtimeUpdates()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
