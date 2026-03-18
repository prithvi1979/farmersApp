const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// @route   POST /api/ai/diagnose
// @desc    Analyze plant image using Gemini AI
// @access  Public
router.post('/diagnose', aiController.diagnosePlant);

module.exports = router;
