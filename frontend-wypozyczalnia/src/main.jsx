import { StrictMode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.css';
import AdminPanel from './pages/AdminPanel.jsx'
import LoginPanel from './pages/LoginPanel.jsx'
import RegisterPanel from './pages/RegisterPanel.jsx'
import Footer from './components/Footer'
import ReservationsForm from './pages/ReservationsForm.jsx'
import UserPanel from './pages/UserPanel.jsx'
import { isAdminSession } from './utils/authStorage'
import 'bootstrap-icons/font/bootstrap-icons.css';   

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1">
          <Routes>
            <Route path="/*" element={<App />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<LoginPanel />} />
            <Route path="/register" element={<RegisterPanel />} />
            <Route path="/reservations" element={<ReservationsForm />} />
            <Route path="/panel" element={isAdminSession() ? <Navigate to="/admin" replace /> : <UserPanel />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  </StrictMode>
)