const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');

// Define API Routes
router.get('/search', cropController.searchMasterCrops);
router.post('/start', cropController.startCrop);
router.get('/active/:deviceId', cropController.getActiveCrops);
router.get('/active-crop/:id', cropController.getActiveCropById);
router.patch('/task/complete', cropController.completeTask);
router.patch('/task/note', cropController.saveTaskNote);

module.exports = router;
