function formatDateInput(value) {
    return value ? String(value).slice(0, 10) : ''
}

export default function ReservationTable({
    reservations,
    loading,
    emptyMessage,
    showCustomer = false,
    editingId,
    savingId,
    draftDates,
    onDraftChange,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDeleteReservation,
    onCancelReservation,
    editButtonLabel = 'Edit',
    cancelButtonLabel = 'Cancel reservation',
}) {
    if (loading) {
        return <div className="p-4 text-white-50">Loading...</div>
    }

    if (reservations.length === 0) {
        return <div className="p-4 p-lg-5 text-white-50">{emptyMessage}</div>
    }

    return (
        <div className="table-responsive p-2">
            <table className="table table-dark table-hover align-middle mb-0 app-table">
                <thead>
                    <tr>
                        {showCustomer ? <th>Customer</th> : null}
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
                        const isEditing = editingId === reservation._id
                        const carLabel = reservation.car ? `${reservation.car.brand ?? ''} ${reservation.car.model ?? ''}`.trim() : 'Unknown car'
                        const customerEmail = reservation.clientUser?.email || reservation.clientEmail || 'No email'
                        const isCancelled = reservation.status === 'cancelled'

                        return (
                            <tr key={reservation._id}>
                                {showCustomer ? (
                                    <td>
                                        <div className="fw-semibold">{reservation.clientSurname || 'Unknown user'}</div>
                                        <div className="text-white-50 small">{customerEmail}</div>
                                    </td>
                                ) : null}
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
                                                onChange={(event) => onDraftChange('startDate', event.target.value)}
                                            />
                                            <input
                                                type="date"
                                                className="form-control form-control-sm bg-black text-white border-secondary"
                                                min={draftDates.startDate || undefined}
                                                value={draftDates.endDate}
                                                onChange={(event) => onDraftChange('endDate', event.target.value)}
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
                                            <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => onSaveEdit(reservation._id)} disabled={savingId === reservation._id}>
                                                {savingId === reservation._id ? 'Saving...' : 'Save'}
                                            </button>
                                            <button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={onCancelEdit}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="d-flex justify-content-end gap-2 flex-wrap">
                                            {onStartEdit ? (
                                                <button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={() => onStartEdit(reservation)} disabled={isCancelled}>
                                                    {editButtonLabel}
                                                </button>
                                            ) : null}
                                            {onCancelReservation ? (
                                                <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => onCancelReservation(reservation._id)} disabled={isCancelled}>
                                                    {isCancelled ? 'Cancelled' : cancelButtonLabel}
                                                </button>
                                            ) : null}
                                            {onDeleteReservation ? (
                                                <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => onDeleteReservation(reservation._id)}>
                                                    Delete
                                                </button>
                                            ) : null}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
