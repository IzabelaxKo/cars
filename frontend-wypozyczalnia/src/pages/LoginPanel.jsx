import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { isLoggedIn, saveAuthSession } from '../utils/authStorage'
import { fetchJson } from '../utils/api'

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

    async function loginUser(credentials) {
        try {
            return await fetchJson('/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            })
        } catch (error) {
            console.error('Login error:', error)
            throw new Error(error instanceof Error ? error.message : 'An error occurred while trying to log in. Please try again later.', {
                cause: error,
            })
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (isLoggedIn()) {
            setError('You are already logged in.')
            alert('You are already logged in. Please log out before trying to log in again.')
            navigate('/')
            return
        }

        if (!formData.email.trim() || !formData.password.trim()) {
            setError('Please enter both email and password.')
            return
        }

        setIsSubmitting(true)

        try {
            const data = await loginUser({ email: formData.email, password: formData.password })

            saveAuthSession({
                token: data.token,
                userId: data.userId,
                role: data.role,
                userRole: data.userRole,
                isAdmin: data.isAdmin,
                userName: data.userName,
                userEmail: data.userEmail ?? formData.email,
            })

            setSuccess('Login successful. Redirecting to the fleet...')
            window.setTimeout(() => navigate('/', { replace: true }), 400)
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="app-shell h-100">
            <Navbar />
            <div className="container py-4 py-lg-5 h-100 d-flex align-items-center justify-content-center">
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
                            <div className="glass-card rounded-4 border border-secondary border-opacity-25 p-4">
                                <div className="text-uppercase small text-white-50 fw-semibold mb-2">What you can do</div>
                                <ul className="list-unstyled mb-0 text-white-75">
                                    <li className="mb-2 ms-2 text-light">View available cars and current pricing</li>
                                    <li className="mb-2 ms-2 text-light">Track upcoming reservations</li>
                                    <li className="mb-2 ms-2 text-light">Keep your profile ready for faster bookings</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="card glass-card border border-secondary border-opacity-25 shadow-lg bg-black bg-opacity-75 text-white overflow-hidden">
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