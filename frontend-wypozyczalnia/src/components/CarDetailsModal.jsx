import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ReservationChecker from './ReservationChecker'


export default function CarDetailsModal({ car, onClose, isLoggedIn }) {
    const [checkedRange, setCheckedRange] = useState({ startDate: '', endDate: '' })
    const [isAvailable, setIsAvailable] = useState(null)
    const capitalize = (str) => String(str).charAt(0).toUpperCase() + String(str).slice(1)

    if (!car) return null

    const bookingHref = (() => {
        const params = new URLSearchParams({ carId: car.id ?? car._id })
        if (checkedRange.startDate) params.set('startDate', checkedRange.startDate)
        if (checkedRange.endDate) params.set('endDate', checkedRange.endDate)
        return `/reservations?${params.toString()}`
    })()

    const canBook = Boolean(checkedRange.startDate && checkedRange.endDate && isAvailable === true)

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, pointerEvents: 'auto', }} className="d-flex align-items-center justify-content-center">
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.45)' }} />
            <div className="container" style={{ position: 'relative', zIndex: 1060 }}>
                <div className="glass-card rounded-4 border border-secondary border-opacity-25 shadow-lg mx-auto" style={{ maxWidth: 900 }}>
                    <div className="card-body p-4 p-md-5 bg-black bg-opacity-75 text-white rounded-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h3 className="h4 fw-bold mb-1">{capitalize(car.brand)} {capitalize(car.model)}</h3>
                                <div className="text-white-50 small">{capitalize(car.category)} • {car.year}</div>
                            </div>
                            <div>
                                <button className="btn btn-sm btn-outline-danger" onClick={onClose}>Close</button>
                            </div>
                        </div>

                        <div className="row g-4 align-items-start flex-column flex-md-row">
                            <div className="col-md-7 d-flex gap-3 align-items-start flex-column">
                                <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="img-fluid rounded" style={{ maxHeight: 250 }} />
                                <div className="table-responsive w-100">
                                    <table className="table table-dark table-hover align-middle mb-0 app-table">
                                        <tbody>
                                            <tr>
                                                <th scope="row">Price per day</th>
                                                <td>${car.pricePerDay}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Seats</th>
                                                <td>{car.seats}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Gearbox</th>
                                                <td>{capitalize(car.gearbox)}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Fuel type</th>
                                                <td>{capitalize(car.fuelType)}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Reservations currently</th>
                                                <td>{car.reservationsCount}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="col-md-5 d-flex flex-column gap-3">
                                <h6 className="mb-2 text-white-50">Check availability</h6>
                                <ReservationChecker
                                    carId={car.id ?? car._id}
                                    onRangeChange={setCheckedRange}
                                    onAvailabilityChange={setIsAvailable}
                                />

                                <div className="rounded-4 border border-secondary border-opacity-25 p-3 bg-black bg-opacity-50 text-white-75">
                                    <div className="small text-white-50 text-uppercase fw-semibold mb-2">Selected dates</div>
                                    <div className="d-flex flex-column gap-1 small">
                                        <div>Start: {checkedRange.startDate || '-'}</div>
                                        <div>End: {checkedRange.endDate || '-'}</div>
                                        <div>
                                            Status:{' '}
                                            {isAvailable === true
                                                ? <span className="text-success">Available</span>
                                                : isAvailable === false
                                                    ? <span className="text-danger">Occupied</span>
                                                    : <span className="text-white-50">Not checked yet</span>}
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    className={`btn btn-primary ${!canBook ? 'disabled' : ''}`}
                                    to={isLoggedIn ? bookingHref : '/login'}
                                    onClick={(e) => {
                                        if (!canBook) {
                                            e.preventDefault()
                                            return
                                        }
                                        onClose()
                                    }}
                                    aria-disabled={!canBook}
                                    tabIndex={!canBook ? -1 : 0}
                                >
                                    Book this car
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
