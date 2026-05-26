const Reservation = require('../models/Reservation');
const Car = require('../models/Car');
const User = require('../models/User');

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
    const { carId, clientName, clientId, startDate, endDate } = req.body;
    try { 
        const car = await Car.findById(carId);
        const user = await User.findById(clientId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!car) return res.status(404).json({ message: 'Car not found' });
        if (car.status === 'rented') return res.status(400).json({ message: 'Car is already rented' });  
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalPrice = days * car.pricePerDay;
        const reservation = new Reservation({
            car: car._id,
            clientUser: user._id,
            clientSurname: clientName,
            startDate,
            endDate,
            days,   
            totalPrice
        });
        await reservation.save();
        car.status = 'rented';
        await car.save();
        res.status(201).json(reservation);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('car');
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json(reservation);
        const car = await Car.findById(reservation.car._id);
        if (reservation.status === 'cancelled' || reservation.status === 'completed') {
            car.status = 'available';
        } else if (reservation.status === 'active') {
            car.status = 'rented';
        }
        await car.save();
    } catch (err) {
        res.status(400).json({ message: err.message });
    }  
};

exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        const car = await Car.findById(reservation.car._id);
        car.status = 'available';
        await car.save();
        res.json({ message: 'Reservation deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};  
