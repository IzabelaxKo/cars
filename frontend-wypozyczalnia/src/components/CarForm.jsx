import { useState } from 'react'
import { fetchJson, invalidateApiCache } from '../utils/api'

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

const inputClassName = 'form-control bg-dark text-white border-secondary'

function TextField({ label, wrapperClassName = 'col-12 col-md-6', className, ...props }) {
    return (
        <div className={wrapperClassName}>
            <label className="form-label text-white-50 small mb-1">{label}</label>
            <input {...props} className={className ? `${inputClassName} ${className}` : inputClassName} />
        </div>
    )
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
            const newCar = await fetchJson('/cars', {
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

            onCreated?.(newCar)
            invalidateApiCache('/cars')
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
                <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
                    <div>
                        <h2 className="h4 fw-semibold mb-1">Add a car</h2>
                        <p className="text-white-50 mb-0">Keep the form short and fill only the required details.</p>
                    </div>
                    <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose} />
                </div>

                {error ? <div className="alert alert-danger border-0 py-2 mb-4">{error}</div> : null}

                <form className="row g-3" onSubmit={handleSubmit}>
                    <TextField
                        label="Brand"
                        value={form.brand}
                        onChange={(event) => updateField('brand', event.target.value)}
                    />
                    <TextField
                        label="Model"
                        value={form.model}
                        onChange={(event) => updateField('model', event.target.value)}
                    />
                    <TextField
                        label="Category"
                        value={form.category}
                        onChange={(event) => updateField('category', event.target.value)}
                    />
                    <TextField
                        label="Year"
                        type="number"
                        wrapperClassName="col-12 col-md-6"
                        value={form.year}
                        onChange={(event) => updateField('year', event.target.value)}
                    />
                    <TextField
                        label="Fuel type"
                        wrapperClassName="col-12 col-md-6"
                        value={form.fuelType}
                        onChange={(event) => updateField('fuelType', event.target.value)}
                    />
                    <TextField
                        label="Gearbox"
                        wrapperClassName="col-12 col-md-6"
                        value={form.gearbox}
                        onChange={(event) => updateField('gearbox', event.target.value)}
                    />
                    <TextField
                        label="Seats"
                        type="number"
                        wrapperClassName="col-12 col-md-6"
                        value={form.seats}
                        onChange={(event) => updateField('seats', event.target.value)}
                    />
                    <TextField
                        label="Price per day"
                        type="number"
                        wrapperClassName="col-12 col-md-6"
                        value={form.pricePerDay}
                        onChange={(event) => updateField('pricePerDay', event.target.value)}
                    />
                    <TextField
                        label="Image URL"
                        wrapperClassName="col-12"
                        value={form.imageUrl}
                        onChange={(event) => updateField('imageUrl', event.target.value)}
                    />
                    <div className="col-12 d-flex justify-content-end gap-2 pt-2">
                        <button type="button" className="btn btn-outline-light rounded-pill px-4" onClick={resetForm}>
                            Clear
                        </button>
                        <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading}>
                            {loading ? 'Saving...' : 'Add car'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
