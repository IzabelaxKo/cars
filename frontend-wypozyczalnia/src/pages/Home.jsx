import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdminSession, isLoggedIn } from '../utils/authStorage'
import Navbar from '../components/Navbar'
import CarDetailsModal from '../components/CarDetailsModal'
import { fetchJsonCached } from '../utils/api'

function normalizeCar(car, index) {
    const {
        _id, id, brand, make, model, category, year, fuelType, gearbox, seats,
        pricePerDay, reservations, reservationsCount, imageUrl, img, detailsLink, bookingLink,
        createdAt, updatedAt
    } = car || {}

    return {
        id: _id ?? id ?? index,
        brand: brand ?? make ?? 'Unknown brand',
        model: model ?? 'Unknown model',
        category: category ?? 'Unknown category',
        year: year ?? 'Unknown year',
        fuelType: fuelType ?? 'Unknown fuel type',
        gearbox: gearbox ?? 'Unknown transmission',
        seats: seats ?? 'Unknown seats',
        pricePerDay: pricePerDay ?? 'Unknown price',
        reservationsCount: reservationsCount ?? (Array.isArray(reservations) ? reservations.length : (reservations ?? 0)),
        imageUrl: imageUrl ?? img ?? '',
        detailsLink: _id ? `/cars/${_id}` : detailsLink ?? '#',
        bookingLink: _id ? `/reservations?carId=${_id}` : bookingLink ?? '#',
        createdAt,
        updatedAt,
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
    const [sortOption, setSortOption] = useState('default')
    const [searchQuery, setSearchQuery] = useState('')

    const sortedCars = useMemo(() => {
        const list = Array.isArray(cars) ? [...cars] : []
        const q = String(searchQuery || '').trim().toLowerCase()

        // filter by brand or model if query present
        const filtered = q
            ? list.filter((c) => {
                  const brand = String(c.brand || '')
                  const model = String(c.model || '')
                  return (brand + ' ' + model).toLowerCase().includes(q)
              })
            : list

        const parsePrice = (v) => {
            const n = parseFloat(String(v).replace(/[^0-9.-]+/g, ''))
            return Number.isFinite(n) ? n : Infinity
        }

        switch (sortOption) {
            case 'price-asc':
                return filtered.sort((a, b) => parsePrice(a.pricePerDay) - parsePrice(b.pricePerDay))
            case 'price-desc':
                return filtered.sort((a, b) => parsePrice(b.pricePerDay) - parsePrice(a.pricePerDay))
            case 'name-asc':
                return filtered.sort((a, b) => (a.brand + ' ' + (a.model || '')).localeCompare(b.brand + ' ' + (b.model || '')))
            case 'name-desc':
                return filtered.sort((a, b) => (b.brand + ' ' + (b.model || '')).localeCompare(a.brand + ' ' + (a.model || '')))
            default:
                return filtered
        }
    }, [cars, sortOption, searchQuery])

    const handleBookingClick = () => {
        if (!isLoggedInUser) return navigate('/login', { state: { msg: 'Please log in to view your bookings.' } })
        if (isAdminUser) return alert('Admin users do not have bookings. Use a regular account to view bookings.')
        navigate('/panel')
    }

    const capitalize = (s) => typeof s === 'string' && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const data = await fetchJsonCached('/cars')
                const normalizedCars = Array.isArray(data) ? data.map(normalizeCar) : []
                if (!mounted) return
                setCars(normalizedCars)
                setLoadError(normalizedCars.length ? '' : 'No cars were returned from the API.')
            } catch (error) {
                if (error.name !== 'AbortError' && mounted) setLoadError('Could not reach the cars API.')
            } finally {
                if (mounted) setIsLoading(false)
            }
        })()

        return () => { mounted = false }
    }, [])

    return (
        <section className="app-shell">
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
                        <p className="text-white-50 mb-0">The best cars, transparent pricing, effortless booking.</p>
                    </div>
                    <div className="ms-auto d-flex gap-2 align-items-center">
                        <input
                            className="form-control form-control-sm bg-black text-white border-secondary"
                            placeholder="Search brand or model..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ minWidth: '220px' }}
                        />
                        <select className="form-select form-select-sm bg-black text-white border-secondary" value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ minWidth: '180px' }}>
                            <option value="default">Sort: Default</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                            <option value="name-asc">Name: A → Z</option>
                            <option value="name-desc">Name: Z → A</option>
                        </select>
                    </div>
                </div>
                <div className="row g-4" id='fleet'>
                    {isLoading ? (
                        <div className="col-12">
                            <div className="alert alert-secondary mb-0">Loading cars from the API...</div>
                        </div>
                    ) : sortedCars.length > 0 ? (
                        sortedCars.map((car) => (
                            <div className="col-lg-4 col-md-6" key={car.id}>
                                <div className="card h-100 border border-secondary border-opacity-25 shadow-lg overflow-hidden bg-black bg-opacity-50 text-white">
                                    <img src={car.imageUrl} className="card-img-top" alt={`${car.brand} ${car.model}`} style={{ height: '240px', objectFit: 'cover' }} />
                                    <div className="card-body p-4 d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex gap-2 align-items-center justify-content-between w-100">
                                                <h3 className="fw-bold mb-2">{car.brand}</h3>
                                                <p className="text-white-50 mb-0">
                                                     {car.model} • {car.year}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 mb-4">
                                            <span className="badge text-bg-secondary rounded-pill px-3 py-2 bg-opacity-50">{capitalize(car.gearbox)}</span>
                                            <span className="badge text-bg-primary rounded-pill px-3 py-2 bg-opacity-50">{capitalize(car.fuelType)}</span>
                                            <span className="badge text-bg-success rounded-pill px-3 py-2 bg-opacity-50">{capitalize(car.category)}</span>
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
                                                    <button className="btn btn-outline-light rounded-pill px-4 fw-semibold" type="button" onClick={() => setSelectedCar(car)}>
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
                {selectedCar && <CarDetailsModal car={selectedCar} onClose={() => setSelectedCar(null)} isLoggedIn={isLoggedInUser} />}
            </div>
        </section>
    )
}