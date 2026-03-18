const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');

// Define API Routes
router.post('/start', cropController.startCrop);
router.get('/active/:deviceId', cropController.getActiveCrops);
router.patch('/task/complete', cropController.completeTask);

module.exports = router;
