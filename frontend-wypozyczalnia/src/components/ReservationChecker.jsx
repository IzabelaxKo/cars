import React, { useState } from 'react'

const apiBaseUrl = 'http://localhost:3000/api'

export default function ReservationChecker({ carId }) {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [available, setAvailable] = useState(null)
    const [error, setError] = useState('')

    async function checkRange(e) {
        e.preventDefault()
        setError('')
        setAvailable(null)

        if (!startDate || !endDate) {
            setError('Please select both start and end dates')
            return
        }

        const s = new Date(startDate)
        const eDate = new Date(endDate)
        if (isNaN(s.getTime()) || isNaN(eDate.getTime()) || eDate <= s) {
            setError('Invalid date range: end must be after start')
            return
        }

        setLoading(true)
        try {
            const qs = new URLSearchParams({ carId, startDate: s.toISOString(), endDate: eDate.toISOString() })
            const res = await fetch(`${apiBaseUrl}/reservations/check?${qs.toString()}`)
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                throw new Error(d.message || 'Failed to check availability')
            }
            const data = await res.json()
            setAvailable(Boolean(data.available))
        } catch (err) {
            setError(err.message || 'Error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={checkRange} className="d-flex flex-column gap-2">
            <div className="d-flex gap-2">
                <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <button className="btn btn-sm btn-primary" type="submit" disabled={loading}>Check</button>
            </div>
            <div className="d-flex gap-2 align-items-center">
                {loading ? <div className="small text-white-50">Checking...</div> : null}
                {available === true ? <div className="small text-success">Available for selected dates</div> : null}
                {available === false ? <div className="small text-danger">Not available for selected dates</div> : null}
                {error ? <div className="small text-warning">{error}</div> : null}
            </div>
        </form>
    )
}
