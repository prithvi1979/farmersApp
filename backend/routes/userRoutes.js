const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define API Routes
router.post('/onboard', userController.onboardUser);
router.get('/profile/:deviceId', userController.getUserProfile);
router.patch('/register/:deviceId', userController.registerUser);

module.exports = router;
