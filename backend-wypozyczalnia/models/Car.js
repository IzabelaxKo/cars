const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    brand: { type: String, required: true },
    model: { type: String, required: true },
    category: { type: String, required: true },
    year: { type: Number, required: true },
    fuelType: { type: String, required: true },
    gearbox: { type: String, required: true },
    seats: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }],
    imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);