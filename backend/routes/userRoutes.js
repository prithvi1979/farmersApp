const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define API Routes
router.post('/onboard', userController.onboardUser);
router.get('/profile/:deviceId', userController.getUserProfile);
router.patch('/profile/:deviceId', userController.updateUserProfile);
router.patch('/register/:deviceId', userController.registerUser);
router.post('/login', userController.loginUser);

module.exports = router;
