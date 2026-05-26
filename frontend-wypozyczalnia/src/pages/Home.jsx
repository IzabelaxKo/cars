import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdminSession, isLoggedIn } from '../utils/authStorage'
import Navbar from '../components/Navbar'
import CarDetailsModal from '../components/CarDetailsModal'

const apiBaseUrl = 'http://localhost:3000/api'

function normalizeCar(car, index) {
    return {
        id: car._id ?? car.id ?? index,
        brand: car.brand ?? car.make ?? 'Unknown brand',
        model: car.model ?? 'Unknown model',
        category: car.category ?? 'Unknown category',
        year: car.year ?? 'Unknown year',
        fuelType: car.fuelType ?? 'Unknown fuel type',
        gearbox: car.gearbox ?? 'Unknown transmission',
        seats: car.seats ?? 'Unknown seats',
        pricePerDay: car.pricePerDay ?? 'Unknown price',
        reservationsCount: Array.isArray(car.reservations) ? car.reservations.length : (car.reservations ?? 0),
        imageUrl: car.imageUrl ?? car.img ?? '',
        detailsLink: car._id ? `/cars/${car._id}` : car.detailsLink ?? '#',
        bookingLink: car._id ? `/reservations?carId=${car._id}` : car.bookingLink ?? '#',
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
    }
}

export default function Home() {
    const navigate = useNavigate()
    const [cars, setCars] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const isAdminUser = isAdminSession()
    const isLoggedInUser = isLoggedIn()
    const [selectedCar, setSelectedCar] = useState(null)

    const handleBookingClick = () => {
        if (!isLoggedInUser) {
            alert('Please log in to view your bookings.')
            navigate('/login')
            return
        }
        if (isAdminUser) {
            alert('Admin users do not have bookings. Please log in with a regular user account to view bookings.')
            return
        }
        navigate('/panel')
    }

    useEffect(() => {
        const controller = new AbortController()

        async function loadCars() {
            try {
                const response = await fetch(`${apiBaseUrl}/cars`, { signal: controller.signal })

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`)
                }

                const data = await response.json()
                const normalizedCars = Array.isArray(data) ? data.map(normalizeCar) : []

                if (normalizedCars.length > 0) {
                    setCars(normalizedCars)
                    setLoadError('')
                } else {
                    setCars([])
                    setLoadError('No cars were returned from the API.')
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setCars([])
                    setLoadError('Could not reach the cars API.')
                }
            } finally {
                setIsLoading(false)
            }
        }

        loadCars()

        return () => controller.abort()
    }, [])

    return (
        <section className="py-5 mt-4 ">
            <Navbar />
            <div className="container py-4 py-lg-5">
                <div className="row align-items-center g-4 g-lg-5 mb-5">
                    <div className="col-lg-6">
                        <h1 className="display-4 fw-bold text-white mb-3">
                            Rent modern cars without the usual friction.
                        </h1>
                        <p className="lead text-white-50 mb-4">
                            Compare premium vehicles, book in a few clicks, and drive away with transparent daily pricing.
                        </p>
                        <div className="d-flex flex-wrap gap-3 mb-4">
                            <a href="#fleet" className="btn btn-primary btn-lg rounded-pill px-4 fw-semibold text-light text-decoration-none">
                                Browse fleet
                            </a>
                            <button className="btn btn-outline-secondary btn-lg rounded-pill px-4 fw-semibold text-white border-secondary" onClick={handleBookingClick}>
                                View bookings
                            </button>
                        </div>
                        <div className="row g-3">
                            <div className="col-4">
                                <div className="card border border-secondary border-opacity-25 shadow-sm h-100 bg-black bg-opacity-50 text-white">
                                    <div className="card-body">
                                        <div className="fs-3 fw-bold">{cars.length}+</div>
                                        <div className="text-white-50 small">Available cars</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="card border border-secondary border-opacity-25 shadow-sm h-100 bg-black bg-opacity-50 text-white">
                                    <div className="card-body">
                                        <div className="fs-3 fw-bold">24/7</div>
                                        <div className="text-white-50 small">Support</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="card border border-secondary border-opacity-25 shadow-sm h-100 bg-black bg-opacity-50 text-white">
                                    <div className="card-body">
                                        <div className="fs-3 fw-bold">4.9</div>
                                        <div className="text-white-50 small">Average rating</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="card border border-secondary border-opacity-25 shadow-lg overflow-hidden bg-black bg-opacity-50 text-white">
                            <div className="row g-0">
                                <div className="col-md-6">
                                    <img
                                        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
                                        className="img-fluid h-100 object-fit-cover"
                                        alt="Luxury car on the road"
                                        style={{ minHeight: '280px' }}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <div className="card-body p-4 p-lg-5">
                                        <p className="text-white-50 text-uppercase small fw-semibold mb-2">Featured experience</p>
                                        <h2 className="h3 fw-bold mb-3">Designed for fast, clean bookings.</h2>
                                        <p className="text-white-50 mb-4">
                                            Pick a car, check the price, and reserve it
                                        </p>
                                        <div className="d-flex flex-wrap gap-2">
                                            <span className="badge text-bg-dark border border-secondary border-opacity-25 rounded-pill px-3 py-2">Instant booking</span>
                                            <span className="badge text-bg-dark border border-secondary border-opacity-25 rounded-pill px-3 py-2">Clear pricing</span>
                                            <span className="badge text-bg-dark border border-secondary border-opacity-25 rounded-pill px-3 py-2">Premium fleet</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {loadError ? <div className="alert alert-warning border-0 mb-4">{loadError}</div> : null}

                <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-4">
                    <div>
                        <h2 className="h1 fw-bold text-white mb-2">Available Fleet</h2>
                        <p className="text-white-50 mb-0">Premium cars, transparent pricing, effortless booking.</p>
                    </div>
                </div>
                <div className="row g-4" id='fleet'>
                    {isLoading ? (
                        <div className="col-12">
                            <div className="alert alert-secondary mb-0">Loading cars from the API...</div>
                        </div>
                    ) : cars.length > 0 ? (
                        cars.map((car) => (
                            <div className="col-lg-4 col-md-6" key={car.id}>
                                <div className="card h-100 border border-secondary border-opacity-25 shadow-lg overflow-hidden bg-black bg-opacity-50 text-white">
                                    <img
                                        src={car.imageUrl}
                                        className="card-img-top"
                                        alt={`${car.make} ${car.model}`}
                                        style={{ height: '240px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body p-4 d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <h3 className="h5 fw-bold mb-1">{car.make}</h3>
                                                <p className="text-white-50 mb-0">
                                                    {car.model} • {car.year}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 mb-4">
                                            <span className="badge text-bg-secondary rounded-pill px-3 py-2 bg-opacity-50">{String(car.gearbox).toUpperCase()}</span>
                                            <span className="badge text-bg-secondary rounded-pill px-3 py-2 bg-opacity-50">{String(car.fuelType).toUpperCase()}</span>
                                            <span className="badge text-bg-secondary rounded-pill px-3 py-2 bg-opacity-50">{String(car.category).toUpperCase()}</span>
                                            <span className="badge text-bg-dark border border-secondary border-opacity-25 rounded-pill px-3 py-2 text-capitalize">{car.seats} seats</span>
                                        </div>

                                        <div className="mt-auto d-flex justify-content-between align-items-center gap-3">
                                            <div>
                                                <div className="text-white-50 small">From</div>
                                                <div className="fs-4 fw-bold">${car.pricePerDay}<span className="fs-6 fw-normal text-white-50">/day</span></div>
                                            </div>
                                            <div className="d-flex gap-2 flex-wrap justify-content-end">
                                                <div className="d-flex gap-2">
                                                    <Link className="btn btn-primary rounded-pill px-4 fw-semibold" to={isLoggedInUser ? car.bookingLink : '/login'}>
                                                        Book now
                                                    </Link>
                                                    <button className="btn btn-outline-secondary rounded-pill px-4 fw-semibold" type="button" onClick={() => setSelectedCar(car)}>
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12">
                            <div className="alert alert-secondary mb-0">No cars available for rent.</div>
                        </div>
                    )}
                </div>
                {selectedCar ? (
                    <CarDetailsModal car={selectedCar} onClose={() => setSelectedCar(null)} isLoggedIn={isLoggedInUser} />
                ) : null}
            </div>
        </section>
    )
}