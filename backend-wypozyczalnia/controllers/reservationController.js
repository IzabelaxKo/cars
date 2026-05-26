const Reservation = require('../models/Reservation');
const Car = require('../models/Car');
const User = require('../models/User');

exports.getAllReservations = async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { clientUser: userId } : {};
        const reservations = await Reservation.find(filter)
            .populate('car')
            .populate('clientUser', 'email role');
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

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
            return res.status(400).json({ message: 'Invalid date range' });
        }

        const overlapping = await Reservation.findOne({
            car: car._id,
            status: 'active',
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } },
            ],
        });

        if (overlapping) {
            return res.status(400).json({ message: 'Requested dates overlap an existing reservation' });
        }

        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalPrice = days * car.pricePerDay;
        const reservation = new Reservation({
            car: car._id,
            clientUser: user._id,
            clientSurname: clientName,
            startDate: start,
            endDate: end,
            days,
            totalPrice,
        });
        await reservation.save();

        if (!car.reservations.some((reservationId) => String(reservationId) === String(reservation._id))) {
            car.reservations.push(reservation._id);
            await car.save();
        }

        const today = new Date();
        if (start <= today && today <= end) {
            car.status = 'rented';
            await car.save();
        }

        res.status(201).json(reservation);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('car');
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

        const requestedStartDate = req.body.startDate;
        const requestedEndDate = req.body.endDate;
        const nextStatus = req.body.status || reservation.status;

        const nextStart = requestedStartDate ? new Date(requestedStartDate) : new Date(reservation.startDate);
        const nextEnd = requestedEndDate ? new Date(requestedEndDate) : new Date(reservation.endDate);

        if (isNaN(nextStart.getTime()) || isNaN(nextEnd.getTime()) || nextEnd <= nextStart) {
            return res.status(400).json({ message: 'Invalid date range' });
        }

        if (nextStatus === 'active') {
            const overlapping = await Reservation.findOne({
                _id: { $ne: reservation._id },
                car: reservation.car._id,
                status: 'active',
                $or: [{ startDate: { $lte: nextEnd }, endDate: { $gte: nextStart } }],
            });

            if (overlapping) {
                return res.status(400).json({ message: 'Requested dates overlap an existing reservation' });
            }
        }

        reservation.startDate = nextStart;
        reservation.endDate = nextEnd;
        reservation.status = nextStatus;

        const days = Math.ceil((nextEnd - nextStart) / (1000 * 60 * 60 * 24));
        reservation.days = days;
        reservation.totalPrice = days * Number(reservation.car.pricePerDay || 0);

        await reservation.save();

        const car = await Car.findById(reservation.car._id);
        if (car) {
            if (reservation.status === 'cancelled' || reservation.status === 'completed') {
                car.status = 'available';
            } else if (reservation.status === 'active') {
                car.status = 'rented';
            }
            await car.save();
        }

        const updatedReservation = await Reservation.findById(reservation._id)
            .populate('car')
            .populate('clientUser', 'email role');
        return res.json(updatedReservation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }  
};

exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        const car = await Car.findById(reservation.car._id);
        if (car) {
            car.reservations = car.reservations.filter((reservationId) => String(reservationId) !== String(reservation._id));
            car.status = 'available';
            await car.save();
        }
        res.json({ message: 'Reservation deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};  


exports.checkAvailability = async (req, res) => {
    const { carId, startDate, endDate } = req.query;
    try {
        const car = await Car.findById(carId);
        if (!car) return res.status(404).json({ message: 'Car not found' });    
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
            return res.status(400).json({ message: 'Invalid date range' });
        }   
        const overlapping = await Reservation.findOne({
            car: car._id,
            status: 'active',
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } },
            ],
        });
        res.json({ available: !overlapping });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }   
}

exports.getUsersReservations = async (req, res) => {
    const { userId } = req.params; 
    try {
        const reservations = await Reservation.find({ clientUser: userId }).populate('car');    
        return res.json(reservations);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}