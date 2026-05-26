const Car = require('../models/Car');
const Reservation = require('../models/Reservation');

exports.getAllCars = async (req, res) => {
    try {
        const [cars, reservationCounts] = await Promise.all([
            Car.find(),
            Reservation.aggregate([
                { $group: { _id: '$car', count: { $sum: 1 } } },
            ]),
        ]);

        const countByCarId = new Map(
            reservationCounts.map((entry) => [String(entry._id), entry.count])
        );

        return res.json(
            cars.map((car) => ({
                ...car.toObject(),
                reservationsCount: countByCarId.get(String(car._id)) ?? car.reservations?.length ?? 0,
            }))
        );
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};  

exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: 'Car not found' });

        const reservationCount = await Reservation.countDocuments({ car: car._id });
        res.json({
            ...car.toObject(),
            reservationsCount: reservationCount,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    } 
};

exports.getCarFiltered = async (req, res) => {
    const { type, value } = req.params;
    try {        
        const cars = await Car.find({ [type]: value });
        if (cars.length === 0) return res.status(404).json({ message: 'No cars found' });
        res.json(cars);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } 
};


exports.addCar = async (req, res) => {
    const { brand, model, category, year, fuelType, gearbox, seats, pricePerDay, imageUrl } = req.body; 
    const car = new Car({ brand, model, category, year, fuelType, gearbox, seats, pricePerDay, imageUrl });
    try {
        const newCar = await car.save();
        res.status(201).json(newCar);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }   
};

exports.updateCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.json(car);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.json({ message: 'Car deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
