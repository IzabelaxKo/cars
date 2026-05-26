import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { AUTH_KEYS, getAuthValue, saveAuthSession, isAdminSession, isLoggedIn } from '../utils/authStorage'

const apiBaseUrl = 'http://localhost:3000/api'

function formatCarLabel(car) {
    if (!car) {
        return 'Choose a car'
    }

    return `${car.brand} ${car.model} • ${car.year} • $${car.pricePerDay}/day`
}

export default function ReservationsForm() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [cars, setCars] = useState([])
    const [isLoadingCars, setIsLoadingCars] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [submitError, setSubmitError] = useState('')
    const [submitSuccess, setSubmitSuccess] = useState('')
    const [resolvedUserId, setResolvedUserId] = useState(getAuthValue(AUTH_KEYS.userId) ?? '')
    const initialStartDate = searchParams.get('startDate') ?? ''
    const initialEndDate = searchParams.get('endDate') ?? ''
    const [formData, setFormData] = useState({
        carId: searchParams.get('carId') ?? '',
        clientSurname: getAuthValue(AUTH_KEYS.userName) ?? '',
        startDate: initialStartDate,
        endDate: initialEndDate,
    })

    const isLoggedInUser = isLoggedIn()
    const isAdminUser = isAdminSession()
    const currentUserEmail = getAuthValue(AUTH_KEYS.userEmail) ?? ''
    const currentUserLabel = getAuthValue(AUTH_KEYS.userName) ?? currentUserEmail ?? 'Signed-in user'

    useEffect(() => {
        let cancelled = false
        async function resolveUserId() {
            if (!isLoggedInUser || resolvedUserId) return
            if (!currentUserEmail) return
            try {
                const resp = await fetch(`${apiBaseUrl}/users/email/${encodeURIComponent(currentUserEmail)}`)
                if (!resp.ok) return
                const user = await resp.json()
                if (user && user._id && !cancelled) {
                    setResolvedUserId(user._id)
                    try {
                        saveAuthSession({ [AUTH_KEYS.userId]: user._id })
                    } catch {  }
                }
            } catch {   }
        }

        resolveUserId()

        return () => {
            cancelled = true
        }
    }, [isLoggedInUser, resolvedUserId, currentUserEmail])

    useEffect(() => {
        const controller = new AbortController()

        async function loadCars() {
            try {
                const response = await fetch(`${apiBaseUrl}/cars`, { signal: controller.signal })

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`)
                }

                const data = await response.json()
                setCars(Array.isArray(data) ? data : [])
                setLoadError('')
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setCars([])
                    setLoadError('Could not load cars from the backend.')
                }
            } finally {
                setIsLoadingCars(false)
            }
        }

        loadCars()

        return () => controller.abort()
    }, [])

    const selectedCar = useMemo(
        () => cars.find((car) => String(car._id) === String(formData.carId)),
        [cars, formData.carId]
    )

    function parseDate(value) {
        if (!value) {
            return null
        }

        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? null : date
    }

    function formatDateISO(date) {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        return d.toISOString().slice(0, 10)
    }

    const minStartDate = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        d.setHours(0, 0, 0, 0)
        return formatDateISO(d)
    }, [])

    const minEndDate = useMemo(() => {
        const start = parseDate(formData.startDate)
        if (start) {
            const d = new Date(start)
            d.setDate(d.getDate() + 1)
            d.setHours(0, 0, 0, 0)
            return formatDateISO(d)
        }

        const d = new Date()
        d.setDate(d.getDate() + 2)
        d.setHours(0, 0, 0, 0)
        return formatDateISO(d)
    }, [formData.startDate])

    const bookingSummary = useMemo(() => {
        if (!selectedCar || !formData.startDate || !formData.endDate) {
            return { days: 0, totalPrice: 0 }
        }

        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

        if (!Number.isFinite(days) || days <= 0) {
            return { days: 0, totalPrice: 0 }
        }

        return {
            days,
            totalPrice: days * Number(selectedCar.pricePerDay || 0),
        }
    }, [formData.endDate, formData.startDate, selectedCar])

    const canSubmitReservation = isLoggedInUser && !isAdminUser && bookingSummary.days > 0 && !!resolvedUserId

    function handleChange(event) {
        const { name, value } = event.target
        setFormData((current) => {
            const next = { ...current, [name]: value }
            if (name === 'startDate' && next.endDate) {
                const minEnd = parseDate(formatDateISO(new Date(new Date(next.startDate).setDate(new Date(next.startDate).getDate() + 1))))
                const currentEnd = parseDate(next.endDate)
                if (currentEnd && minEnd && currentEnd < minEnd) {
                    next.endDate = formatDateISO(minEnd)
                }
            }
            return next
        })

        if (submitError) {
            setSubmitError('')
        }
        if (submitSuccess) {
            setSubmitSuccess('')
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setSubmitError('')
        setSubmitSuccess('')

        if (!isLoggedInUser) {
            setSubmitError('Please log in before making a reservation.')
            navigate('/login')
            return
        }

        if (isAdminUser) {
            setSubmitError('Admin accounts cannot create reservations.')
            return
        }

        if (!resolvedUserId) {
            setSubmitError('Could not resolve your account. Please log in again.')
            return
        }

        if (!formData.carId || !formData.clientSurname.trim() || !formData.startDate || !formData.endDate) {
            setSubmitError('Select a car, enter your surname, and choose both dates.')
            return
        }

        if (bookingSummary.days <= 0) {
            setSubmitError('End date must be after the start date.')
            return
        }

        try {
            const response = await fetch(`${apiBaseUrl}/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carId: formData.carId,
                    clientName: formData.clientSurname.trim(),
                    clientId: resolvedUserId,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Reservation could not be created.')
            }

            const createdReservation = await response.json()
            setSubmitSuccess('Reservation created successfully. Redirecting to your panel...')
            setFormData({
                carId: '',
                clientSurname: getAuthValue(AUTH_KEYS.userName) ?? '',
                startDate: '',
                endDate: '',
            })
            window.setTimeout(() => {
                navigate('/panel', { state: { reservationId: createdReservation._id } })
            }, 900)
        } catch (error) {
            setSubmitError(error.message || 'Reservation failed. Please try again.')
        }
    }

    return (
        <main className="app-shell py-5 h-100 pb-0">
            <Navbar />
            <div className="container py-4 mt-4 mb-4 py-lg-5">
                <div className="row justify-content-center align-items-center g-4 g-lg-5">
                    <div className="col-lg-5">
                        <div className="auth-copy mb-4 mb-lg-0">
                            <span className="badge text-bg-dark border border-secondary border-opacity-25 text-uppercase fw-semibold px-3 py-2 mb-3">
                                Reservation details
                            </span>
                            <h1 className="display-5 fw-bold text-white mb-3">Reserve a car with a clean, premium flow.</h1>
                            <p className="lead text-white-50 mb-4">
                                Pick a vehicle, set your dates, and review the live price summary before you confirm.
                            </p>
                            <div className="glass-card rounded-4 border border-secondary border-opacity-25 p-4 mb-4">
                                <div className="text-uppercase small text-white-50 fw-semibold mb-2">Reservation fields</div>
                                <ul className="list-unstyled mb-0 text-white-75">
                                    <li className="mb-2 ms-2 text-light">Car selection from the backend fleet</li>
                                    <li className="mb-2 ms-2 text-light">Start and end dates for the rental window</li>
                                    <li className="mb-2 ms-2 text-light">Client surname, user ID, and calculated total</li>
                                </ul>
                            </div>
                            <div className="alert alert-secondary border-0 bg-black bg-opacity-50 text-white-50 mb-0">
                                <div className="fw-semibold text-white mb-1">Signed in as</div>
                                <div>{currentUserLabel}</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-7">
                        <div className="card border border-secondary border-opacity-25 shadow-lg bg-black bg-opacity-75 text-white overflow-hidden">
                            <div className="card-body p-4 p-md-5">
                                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                                    <div>
                                        <p className="text-white-50 text-uppercase small fw-semibold mb-1">Book now</p>
                                        <h2 className="h3 fw-bold mb-0">Create a reservation</h2>
                                    </div>
                                    <span className="badge text-bg-secondary rounded-pill px-3 py-2 bg-opacity-50">Live price summary</span>
                                </div>

                                {isAdminUser ? (
                                    <div className="alert alert-warning border-0 mb-4">
                                        Admin accounts can view the layout, but reservations are reserved for regular users.
                                    </div>
                                ) : null}

                                {!isLoggedInUser ? (
                                    <div className="alert alert-info border-0 mb-4">
                                        Log in to fill this form and confirm a booking.
                                    </div>
                                ) : null}

                                <form onSubmit={handleSubmit} className="auth-form">
                                    <div className="mb-3">
                                        <label className="form-label text-white-50" htmlFor="reservationCar">
                                            Select car
                                        </label>
                                        <select
                                            id="reservationCar"
                                            name="carId"
                                            className="form-select form-select-lg bg-dark text-white border-secondary"
                                            value={formData.carId}
                                            onChange={handleChange}
                                            disabled={isLoadingCars || !cars.length}
                                        >
                                            <option value="">{isLoadingCars ? 'Loading cars...' : 'Choose a vehicle'}</option>
                                            {cars.map((car) => (
                                                <option key={car._id} value={car._id}>
                                                    {formatCarLabel(car)}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="form-text text-white-50 mt-2">
                                            Pick any car, then choose a date range.
                                        </div>
                                        {loadError ? <div className="form-text text-warning mt-2">{loadError}</div> : null}
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label text-white-50" htmlFor="reservationSurname">
                                                Client surname
                                            </label>
                                            <input
                                                id="reservationSurname"
                                                name="clientSurname"
                                                type="text"
                                                className="form-control form-control-lg bg-dark text-white border-secondary"
                                                placeholder="Enter your surname"
                                                value={formData.clientSurname}
                                                onChange={handleChange}
                                                autoComplete="family-name"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-white-50" htmlFor="reservationUserId">
                                                Client ID
                                            </label>
                                            <input
                                                id="reservationUserId"
                                                name="clientId"
                                                type="text"
                                                className="form-control form-control-lg bg-dark text-white border-secondary"
                                                value={resolvedUserId || 'Will be resolved from your account'}
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-3 mt-0">
                                        <div className="col-md-6">
                                            <label className="form-label text-white-50" htmlFor="reservationStartDate">
                                                Start date
                                            </label>
                                            <input
                                                id="reservationStartDate"
                                                name="startDate"
                                                type="date"
                                                className="form-control form-control-lg bg-dark text-white border-secondary"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                min={minStartDate}
                                            />
                                            <div className="form-text text-white-50">Earliest start: {new Date(minStartDate).toLocaleDateString()}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-white-50" htmlFor="reservationEndDate">
                                                End date
                                            </label>
                                            <input
                                                id="reservationEndDate"
                                                name="endDate"
                                                type="date"
                                                className="form-control form-control-lg bg-dark text-white border-secondary"
                                                value={formData.endDate}
                                                onChange={handleChange}
                                                min={minEndDate}
                                            />
                                            <div className="form-text text-white-50">Earliest end: {new Date(minEndDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <div className="row g-3 mt-1">
                                        <div className="col-lg-7">
                                            <div className="rounded-4 border border-secondary border-opacity-25 p-3 h-100 bg-black bg-opacity-50">
                                                <div className="text-uppercase small text-white-50 fw-semibold mb-2">Booking preview</div>
                                                <div className="fw-semibold mb-1">{selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'No car selected yet'}</div>
                                                <div className="text-white-50 small mb-3">
                                                    {selectedCar ? `${selectedCar.category} • ${selectedCar.gearbox} • ${selectedCar.fuelType}` : 'Choose a car to see the preview'}
                                                </div>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <span className="badge text-bg-dark border border-secondary border-opacity-25 rounded-pill px-3 py-2">
                                                        {bookingSummary.days > 0 ? `${bookingSummary.days} day(s)` : 'Days calculated automatically'}
                                                    </span>
                                                    <span className="badge text-bg-dark border border-secondary border-opacity-25 rounded-pill px-3 py-2">
                                                        {bookingSummary.totalPrice > 0 ? `$${bookingSummary.totalPrice}` : 'Total price preview'}
                                                    </span>
                                                    <span className="badge text-bg-dark border border-secondary border-opacity-25 rounded-pill px-3 py-2">
                                                        {selectedCar ? `$${selectedCar.pricePerDay}/day` : 'Daily rate'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-5">
                                            <div className="rounded-4 border border-secondary border-opacity-25 p-3 h-100 bg-black bg-opacity-50">
                                                <div className="text-uppercase small text-white-50 fw-semibold mb-2">Summary</div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-white-50">Car</span>
                                                    <span className="text-end">{selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : '-'}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-white-50">Days</span>
                                                    <span>{bookingSummary.days || '-'}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-3">
                                                    <span className="text-white-50">Total</span>
                                                    <span className="fw-bold">{bookingSummary.totalPrice ? `$${bookingSummary.totalPrice}` : '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {submitError ? <div className="alert alert-danger py-2 mt-4 mb-0">{submitError}</div> : null}
                                    {submitSuccess ? <div className="alert alert-success py-2 mt-4 mb-0">{submitSuccess}</div> : null}

                                    <div className="d-flex flex-wrap gap-3 mt-4">
                                        <button className="btn btn-primary btn-lg rounded-pill px-4 fw-semibold" type="submit" disabled={!canSubmitReservation}>
                                            Confirm reservation
                                        </button>
                                        <a className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold" href="/">
                                            Back to fleet
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}