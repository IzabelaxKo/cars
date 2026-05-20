import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function LoginPanel() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ email: '', password: '', rememberMe: true })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    function handleChange(event) {
        const { name, value, type, checked } = event.target
        setFormData((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (!formData.email.trim() || !formData.password.trim()) {
            setError('Please enter both email and password.')
            return
        }

        setIsSubmitting(true)

        window.setTimeout(() => {
            localStorage.setItem('token', 'user-session-token')
            localStorage.setItem('role', 'user')
            localStorage.setItem('userEmail', formData.email.trim())

            if (formData.rememberMe) {
                localStorage.setItem('rememberMe', 'true')
            } else {
                localStorage.removeItem('rememberMe')
            }

            setSuccess('Login successful. Redirecting to the fleet...')
            setIsSubmitting(false)
            navigate('/')
        }, 400)
    }

    return (
        <main className="auth-page py-5">
            <Navbar />
            <div className="container mt-4 py-4 py-lg-5">
                <div className="row justify-content-center align-items-center g-4 g-lg-5">
                    <div className="col-lg-5">
                        <div className="auth-copy mb-4 mb-lg-0">
                            <span className="badge text-bg-dark border border-secondary border-opacity-25 text-uppercase fw-semibold px-3 py-2 mb-3">
                                End user access
                            </span>
                            <h1 className="display-5 fw-bold text-white mb-3">Welcome back to your booking space.</h1>
                            <p className="lead text-white-50 mb-4">
                                Sign in to view your reservations, manage bookings, and continue where you left off.
                            </p>
                            <div className="auth-quick-card rounded-4 border border-secondary border-opacity-25 p-4">
                                <div className="text-uppercase small text-white-50 fw-semibold mb-2">What you can do</div>
                                <ul className="list-unstyled mb-0 text-white-75">
                                    <li className="mb-2">View available cars and current pricing</li>
                                    <li className="mb-2">Track upcoming reservations</li>
                                    <li>Keep your profile ready for faster bookings</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="card auth-card border border-secondary border-opacity-25 shadow-lg bg-black bg-opacity-75 text-white overflow-hidden">
                            <div className="card-body p-4 p-md-5">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div>
                                        <p className="text-white-50 text-uppercase small fw-semibold mb-1">Login</p>
                                        <h2 className="h3 fw-bold mb-0">Sign in to your account</h2>
                                    </div>
                                    <span className="badge text-bg-secondary rounded-pill px-3 py-2 bg-opacity-50">Member</span>
                                </div>

                                <form onSubmit={handleSubmit} className="auth-form">
                                    <div className="mb-3">
                                        <label className="form-label text-white-50" htmlFor="loginEmail">
                                            Email address
                                        </label>
                                        <input
                                            id="loginEmail"
                                            name="email"
                                            type="email"
                                            className="form-control form-control-lg bg-dark text-white border-secondary"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-white-50" htmlFor="loginPassword">
                                            Password
                                        </label>
                                        <input
                                            id="loginPassword"
                                            name="password"
                                            type="password"
                                            className="form-control form-control-lg bg-dark text-white border-secondary"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="current-password"
                                        />
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
                                        <div className="form-check">
                                            <input
                                                id="rememberMe"
                                                name="rememberMe"
                                                className="form-check-input border-secondary"
                                                type="checkbox"
                                                checked={formData.rememberMe}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label text-white-50" htmlFor="rememberMe">
                                                Remember me
                                            </label>
                                        </div>
                                        <a className="link-light text-decoration-none" href="/register">
                                            Need an account?
                                        </a>
                                    </div>

                                    {error ? <div className="alert alert-danger py-2">{error}</div> : null}
                                    {success ? <div className="alert alert-success py-2">{success}</div> : null}

                                    <button className="btn btn-primary btn-lg w-100 rounded-pill fw-semibold" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Signing in...' : 'Login'}
                                    </button>

                                    <p className="text-center text-white-50 mt-4 mb-0">
                                        New here? <Link to="/register" className="link-light fw-semibold text-decoration-none">Create an account</Link>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}