const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    clientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientSurname: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);