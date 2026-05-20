import { StrictMode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'  
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.css';
import AdminPanel from './pages/AdminPanel.jsx'
import LoginPanel from './pages/LoginPanel.jsx'
import RegisterPanel from './pages/RegisterPanel.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<LoginPanel />} />
        <Route path="/register" element={<RegisterPanel />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)