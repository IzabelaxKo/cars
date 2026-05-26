const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.addUser);
router.get('/', userController.getAllUsers);
router.get('/email/:email', userController.getUserByEmail);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/login', userController.loginUser);

module.exports = router;