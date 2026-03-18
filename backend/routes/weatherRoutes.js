const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// GET /api/weather/by-ip — fetch weather based on caller's IP (no deviceId needed)
// MUST be declared BEFORE /:deviceId to avoid being swallowed as a param
router.get('/by-ip', weatherController.getWeatherByIp);

// GET /api/weather/:deviceId — fetch weather for a known onboarded user
router.get('/:deviceId', weatherController.getWeather);

module.exports = router;
