import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CarForm from '../components/CarForm'
import CarsTable from '../components/CarsTable'
import ReservationTable from '../components/ReservationTable'
import { isAdminSession, isLoggedIn } from '../utils/authStorage'

const apiBaseUrl = 'http://localhost:3000/api'

export default function AdminPanel() {
    const navigate = useNavigate()
    const [cars, setCars] = useState([])
    const [carsLoading, setCarsLoading] = useState(true)
    const [showCarForm, setShowCarForm] = useState(false)
    const [activeView, setActiveView] = useState('cars')
    const [reservations, setReservations] = useState([])
    const [reservationsLoading, setReservationsLoading] = useState(true)
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

        async function loadCars() {
            setCarsLoading(true)

            try {
                const response = await fetch(`${apiBaseUrl}/cars`, { signal: controller.signal })
                if (!response.ok) {
                    throw new Error('Could not load cars.')
                }

                const data = await response.json()
                setCars(Array.isArray(data) ? data : [])
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setCars([])
                    setError(err.message || 'Could not load cars.')
                }
            } finally {
                setCarsLoading(false)
            }
        }

        async function loadReservations() {
            setReservationsLoading(true)

            try {
                const response = await fetch(`${apiBaseUrl}/reservations`, { signal: controller.signal })
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
                    const usersResponse = await fetch(`${apiBaseUrl}/users`, { signal: controller.signal })

                    if (usersResponse.ok) {
                        const users = await usersResponse.json()
                        const userEmailById = new Map(
                            (Array.isArray(users) ? users : []).map((user) => [String(user._id), user.email])
                        )

                        nextReservations = nextReservations.map((reservation) => {
                            if (typeof reservation.clientUser !== 'string') {
                                return reservation
                            }

                            return {
                                ...reservation,
                                clientUser: {
                                    _id: reservation.clientUser,
                                    email: userEmailById.get(String(reservation.clientUser)) || '',
                                },
                            }
                        })
                    }
                }

                setReservations(nextReservations)
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setReservations([])
                    setError(err.message || 'Could not load reservations.')
                }
            } finally {
                setReservationsLoading(false)
            }
        }

        setError('')
        loadCars()
        loadReservations()

        return () => controller.abort()
    }, [isLoggedInUser, isAdminUser])

    function openCarForm() {
        setShowCarForm(true)
        setActiveView('cars')
    }

    async function handleDeleteCar(car) {
        if (!window.confirm(`Delete ${car.brand} ${car.model}?`)) {
            return
        }

        try {
            const response = await fetch(`${apiBaseUrl}/cars/${car._id}`, { method: 'DELETE' })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Could not delete car.')
            }

            setCars((current) => current.filter((item) => item._id !== car._id))
        } catch (err) {
            setError(err.message || 'Could not delete car.')
        }
    }

    function startEditing(reservation) {
        setEditingId(reservation._id)
        setDraftDates({
            startDate: reservation.startDate ? String(reservation.startDate).slice(0, 10) : '',
            endDate: reservation.endDate ? String(reservation.endDate).slice(0, 10) : '',
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
                            <button className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={() => navigate('/')}>Go to main page</button>
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
                <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 className="display-5 fw-bold text-white mb-2">Cars and reservations</h1>
                        <p className="text-white-50 mb-0">Switch between the fleet and reservations.</p>
                    </div>
                    <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3">
                        <div className="btn-group" role="group" aria-label="Admin view switcher">
                            <button type="button" className={`btn ${activeView === 'cars' ? 'btn-light' : 'btn-outline-light'}`} onClick={() => setActiveView('cars')}>Cars</button>
                            <button type="button" className={`btn ${activeView === 'reservations' ? 'btn-light' : 'btn-outline-light'}`} onClick={() => setActiveView('reservations')}>Reservations</button>
                        </div>
                        <button type="button" className="btn btn-primary" onClick={openCarForm}>Add car</button>
                    </div>
                </div>

                {error ? <div className="alert alert-danger border-0">{error}</div> : null}

                <CarForm open={showCarForm} onClose={() => setShowCarForm(false)} onCreated={(car) => setCars((current) => [car, ...current])} />

                {activeView === 'cars' ? (
                    <div className="card glass-card border border-secondary border-opacity-25 shadow-lg bg-black bg-opacity-50 text-white mb-4">
                        <div className="card-body p-0">
                            <div className="d-flex align-items-center justify-content-between gap-3 px-4 pt-4 pb-3">
                                <div>
                                    <h2 className="h4 fw-semibold mb-1">Cars</h2>
                                    <p className="text-white-50 mb-0">Simple table view of the fleet.</p>
                                </div>
                            </div>
                            <CarsTable cars={cars} loading={carsLoading} onDeleteCar={handleDeleteCar} />
                        </div>
                    </div>
                ) : null}

                {activeView === 'reservations' ? (
                    <div className="card glass-card border border-secondary border-opacity-25 shadow-lg bg-black bg-opacity-50 text-white">
                        <div className="card-body p-0">
                            <div className="d-flex align-items-center justify-content-between gap-3 px-4 pt-4 pb-3">
                                <div>
                                    <h2 className="h4 fw-semibold mb-1">Reservations</h2>
                                    <p className="text-white-50 mb-0">Edit dates or cancel any reservation.</p>
                                </div>
                            </div>
                            <ReservationTable
                                reservations={reservations}
                                loading={reservationsLoading}
                                emptyMessage="There are no reservations yet."
                                showCustomer
                                editingId={editingId}
                                savingId={savingId}
                                draftDates={draftDates}
                                onDraftChange={(field, value) => setDraftDates((current) => ({ ...current, [field]: value }))}
                                onStartEdit={startEditing}
                                onCancelEdit={cancelEditing}
                                onSaveEdit={handleSaveDates}
                                onCancelReservation={handleCancelReservation}
                                editButtonLabel="Edit dates"
                                cancelButtonLabel="Cancel reservation"
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        </main>
    )
}
