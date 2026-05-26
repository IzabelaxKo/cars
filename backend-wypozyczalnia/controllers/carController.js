const Car = require('../models/Car');
const sampleCars = require('../data/cars');

exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find();
        if (Array.isArray(cars) && cars.length > 0) {
            return res.json(cars);
        }

        return res.json(sampleCars);
    } catch (err) {
        return res.json(sampleCars);
    }
};  

exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.json(car);
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
