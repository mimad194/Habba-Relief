import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import 'leaflet/dist/leaflet.css'
import './styles/index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode>
 <BrowserRouter>
 <ErrorBoundary>
 <App />
 </ErrorBoundary>
 </BrowserRouter>
 </React.StrictMode>,
)
