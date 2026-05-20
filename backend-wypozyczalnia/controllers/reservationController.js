const Reservation = require('../models/Reservation');
const Car = require('../models/Car');

exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find().populate('car');
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('car');
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }   
};

exports.addReservation = async (req, res) => {
    const { carId, clientName, clientSurname, startDate, endDate } = req.body;
    try { 
        const car = await Car.findById(carId);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        if (car.status === 'rented') return res.status(400).json({ message: 'Car is already rented' });     
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('car');
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json(reservation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }  
};

exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json({ message: 'Reservation deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};  
