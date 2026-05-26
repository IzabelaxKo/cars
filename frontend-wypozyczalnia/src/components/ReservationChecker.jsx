import { useState } from 'react'
import { fetchJson } from '../utils/api'

function formatDateISO(date) {
    const next = new Date(date)
    next.setHours(0, 0, 0, 0)
    return next.toISOString().slice(0, 10)
}

export default function ReservationChecker({ carId, onRangeChange, onAvailabilityChange }) {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [available, setAvailable] = useState(null)
    const [error, setError] = useState('')

    const minStartDate = formatDateISO(new Date(new Date().setDate(new Date().getDate() + 1)))
    const minEndDate = startDate
        ? formatDateISO(new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1)))
        : formatDateISO(new Date(new Date().setDate(new Date().getDate() + 2)))

    function updateStartDate(value) {
        setStartDate(value)
        setAvailable(null)
        onAvailabilityChange?.(null)
        onRangeChange?.({ startDate: value, endDate })
    }

    function updateEndDate(value) {
        setEndDate(value)
        setAvailable(null)
        onAvailabilityChange?.(null)
        onRangeChange?.({ startDate, endDate: value })
    }

    async function checkRange(e) {
        e.preventDefault()
        setError('')
        setAvailable(null)

        if (!carId) {
            setError('Missing car id')
            return
        }

        if (!startDate || !endDate) {
            setError('Please select both start and end dates')
            return
        }

        if (startDate < minStartDate) {
            setError('Start date must be from tomorrow onward')
            return
        }

        if (endDate <= startDate) {
            setError('End date must be after start date')
            return
        }

        if (endDate < minEndDate) {
            setError('End date must be after the selected start date')
            return
        }

        const start = new Date(startDate)
        const end = new Date(endDate)
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
            setError('Invalid date range: end must be after start')
            return
        }

        setLoading(true)
        try {
            const qs = new URLSearchParams({ carId, startDate: start.toISOString(), endDate: end.toISOString() })
            const data = await fetchJson(`/reservations/availability/check?${qs.toString()}`)
            const isAvailable = Boolean(data.available)
            setAvailable(isAvailable)
            onAvailabilityChange?.(isAvailable)
        } catch (err) {
            setError(err.message || 'Error')
            onAvailabilityChange?.(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={checkRange} className="d-flex flex-column gap-2">
            <div className="d-flex flex-column gap-2">
                <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary" value={startDate} min={minStartDate} onChange={(e) => updateStartDate(e.target.value)} />
                <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary" value={endDate} min={minEndDate} onChange={(e) => updateEndDate(e.target.value)} />
            </div>
            <button className="btn btn-sm btn-primary" type="submit" disabled={loading}>Check</button>
            <div className="d-flex gap-2 align-items-center">
                {loading ? <div className="small text-white-50">Checking...</div> : null}
                {error ? <div className="small text-warning">{error}</div> : null}
            </div>
        </form>
    )
}
