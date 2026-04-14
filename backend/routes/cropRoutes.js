const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');

// Define API Routes
router.get('/dictionary/all', cropController.getAllDictionaryCrops);
router.get('/search', cropController.searchMasterCrops);
router.post('/start', cropController.startCrop);
router.get('/active/:deviceId', cropController.getActiveCrops);
router.get('/active-crop/:id', cropController.getActiveCropById);
router.patch('/task/complete', cropController.completeTask);
router.patch('/task/note', cropController.saveTaskNote);

// One-time data migration: stamp userId on all existing crops (call once after deploy)
router.post('/migrate-user-ids', cropController.migrateUserIds);

module.exports = router;
