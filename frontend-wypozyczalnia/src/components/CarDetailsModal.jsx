import React from 'react'
import { Link } from 'react-router-dom'
import ReservationChecker from './ReservationChecker'

export default function CarDetailsModal({ car, onClose, isLoggedIn }) {
    if (!car) return null

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, pointerEvents: 'auto' }}>
            {/* subtle translucent/blur backdrop without full blackout */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />

            <div className="container" style={{ position: 'relative', zIndex: 1060, top: '6vh' }}>
                <div className="glass-card rounded-4 border border-secondary border-opacity-25 shadow-lg mx-auto" style={{ maxWidth: 900 }}>
                    <div className="card-body p-4 p-md-5 bg-black bg-opacity-75 text-white">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h3 className="h4 fw-bold mb-1">{car.brand} {car.model}</h3>
                                <div className="text-white-50 small">{car.category} • {car.year}</div>
                            </div>
                            <div>
                                <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Close</button>
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-5">
                                <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="img-fluid rounded" />
                            </div>
                            <div className="col-md-7">
                                <ul className="list-unstyled text-white-75">
                                    <li><strong>Price per day:</strong> ${car.pricePerDay}</li>
                                    <li><strong>Seats:</strong> {car.seats}</li>
                                    <li><strong>Gearbox:</strong> {car.gearbox}</li>
                                    <li><strong>Fuel type:</strong> {car.fuelType}</li>
                                    <li><strong>Reservations:</strong> {car.reservationsCount}</li>
                                    {car.createdAt ? <li><strong>Added:</strong> {new Date(car.createdAt).toLocaleString()}</li> : null}
                                    {car.updatedAt ? <li><strong>Updated:</strong> {new Date(car.updatedAt).toLocaleString()}</li> : null}
                                </ul>

                                <div className="d-flex gap-2 mt-3">
                                    <Link className="btn btn-primary" to={isLoggedIn ? car.bookingLink : '/login'} onClick={onClose}>Book this car</Link>
                                    <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
                                </div>

                                <div className="mt-4">
                                    <h6 className="mb-2 text-white-50">Check availability</h6>
                                    <ReservationChecker carId={car.id ?? car._id} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
