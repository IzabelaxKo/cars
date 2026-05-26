export default function CarsTable({ cars, loading, onDeleteCar }) {
    if (loading) {
        return <div className="px-4 pb-4 text-white-50">Loading cars...</div>
    }

    if (cars.length === 0) {
        return <div className="px-4 pb-4 text-white-50">There are no cars yet.</div>
    }

    return (
        <div className="table-responsive p-2">
            <table className="table table-dark table-hover align-middle mb-0 app-table">
                <thead>
                    <tr>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Category</th>
                        <th>Year</th>
                        <th>Fuel</th>
                        <th>Gearbox</th>
                        <th>Seats</th>
                        <th>Price/day</th>
                        {onDeleteCar ? <th className="text-end">Actions</th> : null}
                    </tr>
                </thead>
                <tbody>
                    {cars.map((car) => (
                        <tr key={car._id}>
                            <td className="fw-semibold">{car.brand}</td>
                            <td>{car.model}</td>
                            <td>{car.category}</td>
                            <td>{car.year}</td>
                            <td>{car.fuelType}</td>
                            <td>{car.gearbox}</td>
                            <td>{car.seats}</td>
                            <td>${car.pricePerDay}</td>
                            {onDeleteCar ? (
                                <td className="text-end">
                                    <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => onDeleteCar(car)}>
                                        Delete
                                    </button>
                                </td>
                            ) : null}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
