import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { isLoggedIn } from '../utils/authStorage'
import { fetchJson } from '../utils/api'

export default function RegisterPanel() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: true,
    })
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

    async function registerUser(details) {
        try {
            return await fetchJson('/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(details),
            })
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred.', {
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

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        if (!formData.acceptTerms) {
            setError('You need to accept the terms to create an account.')
            return
        }

        setIsSubmitting(true)

        try {
            await registerUser({
                email: formData.email,
                password: formData.password,
            })

            setSuccess('Account created successfully. Redirecting to login...')
            window.setTimeout(() => navigate('/login'), 500)
        } catch (err) {
            console.error('Registration error:', err)
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="app-shell h-100">
            <Navbar />
            <div className="container py-4 py-lg-5">
                <div className="row justify-content-center align-items-center g-4 g-lg-5">
                    <div className="col-lg-5 order-lg-2">
                        <div className="auth-copy mb-4 mb-lg-0">
                            <span className="badge text-bg-dark border border-secondary border-opacity-25 text-uppercase fw-semibold px-3 py-2 mb-3">
                                New customer
                            </span>
                            <h1 className="display-5 fw-bold text-white mb-3">Create your account in a minute.</h1>
                            <p className="lead text-white-50 mb-4">
                                Register to save your details, book faster, and keep all your reservations in one place.
                            </p>
                            <div className="glass-card rounded-4 border border-secondary border-opacity-25 p-4">
                                <div className="text-uppercase small text-white-50 fw-semibold mb-2">Included by default</div>
                                <ul className="list-unstyled mb-0 text-white-75">
                                    <li className="mb-2 ms-2 text-light">Personal booking history</li>
                                    <li className="mb-2 ms-2 text-light">Faster checkout on your next rental</li>
                                    <li className="mb-2 ms-2 text-light">Simple account setup for end users</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5 order-lg-1">
                        <div className="card glass-card border border-secondary border-opacity-25 shadow-lg bg-black bg-opacity-75 text-white overflow-hidden">
                            <div className="card-body p-4 p-md-5">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div>
                                        <p className="text-white-50 text-uppercase small fw-semibold mb-1">Register</p>
                                        <h2 className="h3 fw-bold mb-0">Create a new account</h2>
                                    </div>
                                    <span className="badge text-bg-secondary rounded-pill px-3 py-2 bg-opacity-50">Easy setup</span>
                                </div>

                                <form onSubmit={handleSubmit} className="auth-form">

                                    <div className="mb-3">
                                        <label className="form-label text-white-50" htmlFor="registerEmail">
                                            Email address
                                        </label>
                                        <input
                                            id="registerEmail"
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
                                        <label className="form-label text-white-50" htmlFor="registerPassword">
                                            Password
                                        </label>
                                        <input
                                            id="registerPassword"
                                            name="password"
                                            type="password"
                                            className="form-control form-control-lg bg-dark text-white border-secondary"
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-white-50" htmlFor="confirmPassword">
                                            Confirm password
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            className="form-control form-control-lg bg-dark text-white border-secondary"
                                            placeholder="Repeat your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <div className="form-check mb-4">
                                        <input
                                            id="acceptTerms"
                                            name="acceptTerms"
                                            className="form-check-input border-secondary"
                                            type="checkbox"
                                            checked={formData.acceptTerms}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label text-white-50" htmlFor="acceptTerms">
                                            I agree to the terms and booking rules.
                                        </label>
                                    </div>

                                    {error ? <div className="alert alert-danger py-2">{error}</div> : null}
                                    {success ? <div className="alert alert-success py-2">{success}</div> : null}

                                    <button className="btn btn-primary btn-lg w-100 rounded-pill fw-semibold" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Creating account...' : 'Create account'}
                                    </button>

                                    <p className="text-center text-white-50 mt-4 mb-0">
                                        Already have an account? <Link to="/login" className="link-light fw-semibold text-decoration-none">Sign in</Link>
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