import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { isAdminSession, isLoggedIn } from '../utils/authStorage'

const apiBaseUrl = 'http://localhost:3000/api'

function formatDateInput(value) {
    return value ? String(value).slice(0, 10) : ''
}

export default function AdminPanel() {
    const navigate = useNavigate()
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState('')
    const [savingId, setSavingId] = useState('')
    const [draftDates, setDraftDates] = useState({ startDate: '', endDate: '' })

    const isLoggedInUser = isLoggedIn()
    const isAdminUser = isAdminSession()

    useEffect(() => {
        if (!isLoggedInUser || !isAdminUser) {
            return
        }

        const controller = new AbortController()

        async function loadReservations() {
            setLoading(true)
            try {
                const response = await fetch(`${apiBaseUrl}/reservations`, {
                    signal: controller.signal,
                })

                if (!response.ok) {
                    throw new Error('Could not load reservations.')
                }

                const data = await response.json()
                let nextReservations = Array.isArray(data) ? data : []

                const unresolvedUserIds = [...new Set(
                    nextReservations
                        .map((reservation) => reservation?.clientUser)
                        .filter((clientUser) => typeof clientUser === 'string' && clientUser)
                )]

                if (unresolvedUserIds.length > 0) {
                    const usersResponse = await fetch(`${apiBaseUrl}/users`, {
                        signal: controller.signal,
                    })

                    if (usersResponse.ok) {
                        const users = await usersResponse.json()
                        const userEmailById = new Map(
                            (Array.isArray(users) ? users : []).map((user) => [String(user._id), user.email])
                        )

                        nextReservations = nextReservations.map((reservation) => {
                            if (typeof reservation.clientUser !== 'string') {
                                return reservation
                            }

                            const resolvedEmail = userEmailById.get(String(reservation.clientUser)) || ''
                            return {
                                ...reservation,
                                clientUser: {
                                    _id: reservation.clientUser,
                                    email: resolvedEmail,
                                },
                            }
                        })
                    }
                }

                setReservations(nextReservations)
                setError('')
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setReservations([])
                    setError(err.message || 'Could not load reservations.')
                }
            } finally {
                setLoading(false)
            }
        }

        loadReservations()

        return () => controller.abort()
    }, [isLoggedInUser, isAdminUser])

    function startEditing(reservation) {
        setEditingId(reservation._id)
        setDraftDates({
            startDate: formatDateInput(reservation.startDate),
            endDate: formatDateInput(reservation.endDate),
        })
        setError('')
    }

    function cancelEditing() {
        setEditingId('')
        setDraftDates({ startDate: '', endDate: '' })
    }

    async function handleSaveDates(reservationId) {
        if (!draftDates.startDate || !draftDates.endDate) {
            setError('Pick both dates.')
            return
        }

        if (draftDates.endDate <= draftDates.startDate) {
            setError('End date must be after start date.')
            return
        }

        setSavingId(reservationId)

        try {
            const response = await fetch(`${apiBaseUrl}/reservations/${reservationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: draftDates.startDate,
                    endDate: draftDates.endDate,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Could not update reservation.')
            }

            const updatedReservation = await response.json()
            setReservations((current) =>
                current.map((reservation) => (reservation._id === reservationId ? updatedReservation : reservation))
            )
            cancelEditing()
            setError('')
        } catch (err) {
            setError(err.message || 'Could not update reservation.')
        } finally {
            setSavingId('')
        }
    }

    async function handleCancelReservation(reservationId) {
        if (!window.confirm('Cancel this reservation?')) {
            return
        }

        try {
            const response = await fetch(`${apiBaseUrl}/reservations/${reservationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Could not cancel reservation.')
            }

            const updatedReservation = await response.json()
            setReservations((current) =>
                current.map((reservation) => (reservation._id === reservationId ? updatedReservation : reservation))
            )

            if (editingId === reservationId) {
                cancelEditing()
            }
            setError('')
        } catch (err) {
            setError(err.message || 'Could not cancel reservation.')
        }
    }

    if (!isLoggedInUser || !isAdminUser) {
        return (
            <main className="app-shell py-5 h-100 pb-0">
                <Navbar />
                <div className="container py-4 py-lg-5 mt-4">
                    <div className="card glass-card border border-danger border-opacity-50 shadow-lg bg-black bg-opacity-50 text-white">
                        <div className="card-body p-4 p-lg-5">
                            <p className="text-uppercase text-white-50 small fw-semibold mb-2">Admin access only</p>
                            <h1 className="display-6 fw-bold mb-3">This area is blocked for regular users</h1>
                            <p className="text-white-50 mb-4">Please sign in with an admin account to manage all reservations.</p>
                            <button className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={() => navigate('/')}>
                                Go to main page
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="app-shell py-5 h-100 pb-0">
            <Navbar />
            <div className="container py-4 py-lg-5 mt-4">
                <div className="row align-items-end g-4 mb-4">
                    <div className="col-lg-8">
                        <span className="badge text-bg-dark border border-secondary border-opacity-25 text-uppercase fw-semibold px-3 py-2 mb-3">
                            Admin reservations
                        </span>
                        <h1 className="display-5 fw-bold text-white mb-2">All reservations</h1>
                        <p className="text-white-50 mb-0">Edit dates or cancel any reservation.</p>
                    </div>
                    <div className="col-lg-4 text-lg-end">
                        <div className="card border border-secondary border-opacity-25 bg-black bg-opacity-50 text-white d-inline-flex">
                            <div className="card-body py-3 px-4">
                                <div className="fs-3 fw-bold">{reservations.length}</div>
                                <div className="text-white-50 small">Total reservations</div>
                            </div>
                        </div>
                    </div>
                </div>

                {error ? <div className="alert alert-danger border-0">{error}</div> : null}

                <div className="card glass-card border border-secondary border-opacity-25 shadow-lg bg-black bg-opacity-50 text-white">
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="p-4 text-white-50">Loading all reservations...</div>
                        ) : reservations.length === 0 ? (
                            <div className="p-4 p-lg-5 text-white-50">There are no reservations yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-dark table-hover align-middle mb-0 app-table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Car</th>
                                            <th>Dates</th>
                                            <th>Days</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.map((reservation) => {
                                            const carLabel = reservation.car
                                                ? `${reservation.car.brand ?? ''} ${reservation.car.model ?? ''}`.trim()
                                                : 'Unknown car'
                                            const customerEmail = reservation.clientUser?.email || reservation.clientEmail || 'No email'
                                            const isEditing = editingId === reservation._id
                                            const isCancelled = reservation.status === 'cancelled'

                                            return (
                                                <tr key={reservation._id}>
                                                    <td>
                                                        <div className="fw-semibold">{reservation.clientSurname || 'Unknown user'}</div>
                                                        <div className="text-white-50 small">{customerEmail}</div>
                                                    </td>
                                                    <td>
                                                        <div className="fw-semibold">{carLabel}</div>
                                                        <div className="text-white-50 small">{reservation.car?.year ?? ''}</div>
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <div className="d-flex flex-column gap-2">
                                                                <input
                                                                    type="date"
                                                                    className="form-control form-control-sm bg-black text-white border-secondary"
                                                                    value={draftDates.startDate}
                                                                    onChange={(event) =>
                                                                        setDraftDates((current) => ({ ...current, startDate: event.target.value }))
                                                                    }
                                                                />
                                                                <input
                                                                    type="date"
                                                                    className="form-control form-control-sm bg-black text-white border-secondary"
                                                                    min={draftDates.startDate || undefined}
                                                                    value={draftDates.endDate}
                                                                    onChange={(event) =>
                                                                        setDraftDates((current) => ({ ...current, endDate: event.target.value }))
                                                                    }
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div>{formatDateInput(reservation.startDate)}</div>
                                                                <div className="text-white-50 small">to {formatDateInput(reservation.endDate)}</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>{reservation.days}</td>
                                                    <td>${reservation.totalPrice}</td>
                                                    <td>
                                                        <span
                                                            className={`badge rounded-pill text-uppercase ${
                                                                reservation.status === 'active'
                                                                    ? 'text-bg-success'
                                                                    : reservation.status === 'cancelled'
                                                                        ? 'text-bg-danger'
                                                                        : 'text-bg-secondary'
                                                            }`}
                                                        >
                                                            {reservation.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        {isEditing ? (
                                                            <div className="d-flex justify-content-end gap-2 flex-wrap">
                                                                <button
                                                                    className="btn btn-sm btn-primary rounded-pill px-3"
                                                                    onClick={() => handleSaveDates(reservation._id)}
                                                                    disabled={savingId === reservation._id}
                                                                >
                                                                    {savingId === reservation._id ? 'Saving...' : 'Save'}
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-light rounded-pill px-3"
                                                                    onClick={cancelEditing}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="d-flex justify-content-end gap-2 flex-wrap">
                                                                <button
                                                                    className="btn btn-sm btn-outline-light rounded-pill px-3"
                                                                    onClick={() => startEditing(reservation)}
                                                                    disabled={isCancelled}
                                                                >
                                                                    Edit dates
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                                    onClick={() => handleCancelReservation(reservation._id)}
                                                                    disabled={isCancelled}
                                                                >
                                                                    {isCancelled ? 'Cancelled' : 'Cancel reservation'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}