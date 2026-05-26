import { Link, useNavigate } from 'react-router-dom'
import { clearAuthSession, isAdminSession, isLoggedIn } from '../utils/authStorage'

export default function Navbar() {
    const navigate = useNavigate()
    const isAdminUser = isAdminSession()
    const isLoggedInUser = isLoggedIn()

    const handleLogout = () => {
        clearAuthSession()
        navigate('/')
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top w-100 border-bottom border-secondary border-opacity-25 bg-black bg-opacity-75">
            <div className="container-fluid px-4 px-lg-5 py-2">
                <Link className="navbar-brand fw-bold text-uppercase" to="/">
                    Car Rental
                </Link>
                <div className="d-flex flex-wrap gap-2">
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
                            {isAdminUser ? (
                                <Link className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-semibold text-white border-secondary" to="/admin">
                                    Admin Panel
                                </Link>
                            ) : (
                                <Link className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-semibold text-white border-secondary" to="/panel">
                                    Your Bookings
                                </Link>
                            )}
                            <button className="btn btn-outline-danger btn-sm rounded-pill px-2 fw-semibold" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
