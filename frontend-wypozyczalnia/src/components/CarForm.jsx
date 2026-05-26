import { useState } from 'react'

const apiBaseUrl = 'http://localhost:3000/api'

const emptyForm = {
    brand: '',
    model: '',
    category: '',
    year: '',
    fuelType: '',
    gearbox: '',
    seats: '',
    pricePerDay: '',
    imageUrl: '',
}

export default function CarForm({ open, onClose, onCreated }) {
    const [form, setForm] = useState(emptyForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!open) {
        return null
    }

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }))
    }

    function resetForm() {
        setForm(emptyForm)
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (
            !form.brand.trim() ||
            !form.model.trim() ||
            !form.category.trim() ||
            !form.year ||
            !form.fuelType.trim() ||
            !form.gearbox.trim() ||
            !form.seats ||
            !form.pricePerDay
        ) {
            setError('Fill in all required car fields.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${apiBaseUrl}/cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand: form.brand.trim(),
                    model: form.model.trim(),
                    category: form.category.trim(),
                    year: Number(form.year),
                    fuelType: form.fuelType.trim(),
                    gearbox: form.gearbox.trim(),
                    seats: Number(form.seats),
                    pricePerDay: Number(form.pricePerDay),
                    imageUrl: form.imageUrl.trim(),
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Could not add car.')
            }

            const newCar = await response.json()
            onCreated?.(newCar)
            resetForm()
            onClose?.()
        } catch (err) {
            setError(err.message || 'Could not add car.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card glass-card border border-secondary border-opacity-25 shadow-lg bg-black bg-opacity-50 text-white mb-4">
            <div className="card-body p-4 p-lg-5">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                        <h2 className="h4 fw-semibold mb-1">Add car</h2>
                        <p className="text-white-50 mb-0">Keep it simple and fill only the required fields.</p>
                    </div>
                    <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose} />
                </div>

                {error ? <div className="alert alert-danger border-0 py-2">{error}</div> : null}

                <form className="row g-3" onSubmit={handleSubmit}>
                    <div className="col-md-4">
                        <input className="form-control bg-black text-white border-secondary" placeholder="Brand" value={form.brand} onChange={(event) => updateField('brand', event.target.value)} />
                    </div>
                    <div className="col-md-4">
                        <input className="form-control bg-black text-white border-secondary" placeholder="Model" value={form.model} onChange={(event) => updateField('model', event.target.value)} />
                    </div>
                    <div className="col-md-4">
                        <input className="form-control bg-black text-white border-secondary" placeholder="Category" value={form.category} onChange={(event) => updateField('category', event.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <input type="number" className="form-control bg-black text-white border-secondary" placeholder="Year" value={form.year} onChange={(event) => updateField('year', event.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <input className="form-control bg-black text-white border-secondary" placeholder="Fuel type" value={form.fuelType} onChange={(event) => updateField('fuelType', event.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <input className="form-control bg-black text-white border-secondary" placeholder="Gearbox" value={form.gearbox} onChange={(event) => updateField('gearbox', event.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <input type="number" className="form-control bg-black text-white border-secondary" placeholder="Seats" value={form.seats} onChange={(event) => updateField('seats', event.target.value)} />
                    </div>
                    <div className="col-md-4">
                        <input type="number" className="form-control bg-black text-white border-secondary" placeholder="Price per day" value={form.pricePerDay} onChange={(event) => updateField('pricePerDay', event.target.value)} />
                    </div>
                    <div className="col-md-8">
                        <input className="form-control bg-black text-white border-secondary" placeholder="Image URL (optional)" value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} />
                    </div>
                    <div className="col-12 d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-outline-light rounded-pill px-4" onClick={resetForm}>Clear</button>
                        <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading}>{loading ? 'Saving...' : 'Add car'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
