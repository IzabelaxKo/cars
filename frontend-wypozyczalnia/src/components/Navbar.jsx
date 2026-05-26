import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuthSession, isAdminSession, isLoggedIn, getUserName } from '../utils/authStorage'

export default function Navbar() {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const isLoggedInUser = isLoggedIn()
    const isAdminUser = isAdminSession()
    const userName = getUserName()

    const handleLogout = () => {
        clearAuthSession()
        setMenuOpen(false)
        navigate('/')
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top w-100 border-bottom border-secondary border-opacity-25 bg-black bg-opacity-75">
            <div className="container-fluid ps-4 ps-lg-5 p-0">
                <Link className="navbar-brand fw-bold text-uppercase" to="/">
                    Car Rental
                </Link>
                <div className="d-flex flex-wrap align-items-center gap-2 position-relative">
                    {!isLoggedInUser ? (
                        <>
                            <Link className="btn btn-outline-light btn-sm rounded-pill px-4 fw-semibold" to="/register">
                                Register
                            </Link>
                            <Link className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold" to="/login">
                                Login
                            </Link>
                        </>
                    ) : (
                        <>
                            <button 
                                className="btn btn-primary btn-sm fw-semibold d-flex align-items-center justify-content-center me-1 rounded-circle"
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label={userName}
                                style={{ minWidth: '40px', minHeight: '40px', padding: 0 }}
                            > <i className="bi bi-person"></i>
                            </button>
                            {menuOpen && (
                                <div className="position-absolute top-100 end-0 border border-secondary rounded shadow-lg p-2 mt-3" style={{ zIndex: 1000, minWidth: '220px', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                    <div className="text-white-50 small px-2 py-1 mb-2">{userName}</div>
                                    <Link 
                                        className="btn btn-sm btn-outline-secondary w-100 mb-2 text-white"
                                        to={isAdminUser ? '/admin' : '/panel'}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {isAdminUser ? 'Admin Panel' : 'Your Bookings'}
                                    </Link>
                                    <button 
                                        className="btn btn-sm btn-outline-danger w-100"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
