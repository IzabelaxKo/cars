const express = require('express'); 
const router = express.Router();
const carController = require('../controllers/carController');

router.get('/', carController.getAllCars);
router.get('/:id', carController.getCarById);
router.get('/filter/:type/:value', carController.getCarFiltered);
router.post('/', carController.addCar);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

module.exports = router;