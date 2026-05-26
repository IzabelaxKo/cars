const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/', reservationController.getAllReservations);
router.get('/user/:userId', reservationController.getUsersReservations);
router.get('/:id', reservationController.getReservationById);
router.post('/', reservationController.addReservation);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;