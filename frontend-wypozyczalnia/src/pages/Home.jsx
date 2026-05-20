import { useEffect, useState } from 'react'

const apiBaseUrl = 'http://localhost:3000/api'

const fallbackImageByIndex = [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1549399542-7e1f0b1e0f3b?auto=format&fit=crop&w=900&q=80',
]

function toTitleCase(value) {
    return String(value || '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function normalizeCar(car, index) {
    return {
        id: car._id ?? car.id ?? index,
        make: car.brand ?? car.make ?? 'Unknown brand',
        model: car.model ?? 'Unknown model',
        category: car.category ?? 'Unknown category',  
        year: car.year ?? 'Unknown year',
        fuelType: car.fuelType ? toTitleCase(car.fuelType) : 'Unknown fuel type',
        gearbox: car.gearbox ? toTitleCase(car.gearbox) : 'Unknown transmission',
        seats: car.seats ?? 'Unknown seats',
        pricePerDay: car.pricePerDay ?? 'Unknown price',
        status: car.status ? toTitleCase(car.status) : 'Unknown status',
        imageUrl: car.imageUrl ?? car.img ?? fallbackImageByIndex[index % fallbackImageByIndex.length],
        detailsLink: car._id ? `/cars/${car._id}` : car.detailsLink ?? '#',
        bookingLink: car._id ? `/booking/${car._id}` : car.bookingLink ?? '#',
    }
}

export default function Home() {
    const [cars, setCars] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')

    const isAdminUser = localStorage.getItem('role') === 'admin' || localStorage.getItem('userRole') === 'admin' || localStorage.getItem('isAdmin') === 'true'

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
        <section className="py-5 mt-4">
            <div className="container py-4 py-lg-5">
                <div className="row align-items-center g-4 g-lg-5 mb-5">
                    <div className="col-lg-6">
                        <span className="badge text-bg-dark border border-secondary border-opacity-25 text-uppercase fw-semibold px-3 py-2 mb-3">
                            Premium car rental
                        </span>
                        <h1 className="display-4 fw-bold text-white mb-3">
                            Rent modern cars without the usual friction.
                        </h1>
                        <p className="lead text-white-50 mb-4">
                            Compare premium vehicles, book in a few clicks, and drive away with transparent daily pricing.
                        </p>
                        <div className="d-flex flex-wrap gap-3 mb-4">
                            <button className="btn btn-primary btn-lg rounded-pill px-4 fw-semibold">
                                Browse fleet
                            </button>
                            <button className="btn btn-outline-secondary btn-lg rounded-pill px-4 fw-semibold text-white border-secondary">
                                View booking
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

                <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-4">
                    <div>
                        <h2 className="h1 fw-bold text-white mb-2">Available Fleet</h2>
                        <p className="text-white-50 mb-0">Premium cars, transparent pricing, effortless booking.</p>
                    </div>
                </div>
                <div className="row g-4">
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
                                            <span className="badge text-bg-dark border border-secondary border-opacity-25 rounded-pill">Featured</span>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 mb-4">
                                            <span className="badge text-bg-secondary rounded-pill px-3 py-2 bg-opacity-50">{car.gearbox}</span>
                                            <span className="badge text-bg-secondary rounded-pill px-3 py-2 bg-opacity-50">{car.fuelType}</span>
                                            <span className="badge text-bg-secondary rounded-pill px-3 py-2 bg-opacity-50">{car.category}</span>
                                            <span className="badge text-bg-dark border border-secondary border-opacity-25 rounded-pill px-3 py-2 text-capitalize">{car.status}</span>
                                        </div>

                                        <div className="mt-auto d-flex justify-content-between align-items-center gap-3">
                                            <div>
                                                <div className="text-white-50 small">From</div>
                                                <div className="fs-4 fw-bold">${car.pricePerDay}<span className="fs-6 fw-normal text-white-50">/day</span></div>
                                            </div>
                                            <div className="d-flex gap-2 flex-wrap justify-content-end">
                                                <a className="btn btn-outline-light rounded-pill px-4 fw-semibold" href={car.detailsLink}>
                                                    Details
                                                </a>
                                                <a className="btn btn-primary rounded-pill px-4 fw-semibold" href={car.bookingLink}>
                                                    Book now
                                                </a>
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
            </div>
        </section>
    )
}