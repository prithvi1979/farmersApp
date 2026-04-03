const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// @route   POST /api/ai/diagnose
// @desc    Analyze plant image using Gemini AI
// @access  Public
router.post('/diagnose', aiController.diagnosePlant);

// @route   POST /api/ai/chat
// @desc    Chat with AI assistant using Groq Llama 3
// @access  Public
router.post('/chat', aiController.chat);

// @route   POST /api/ai/mandi-price
// @desc    Check latest crop price at nearest mandi using Gemini Grounding
// @access  Public
router.post('/mandi-price', aiController.getMandiPrice);

// @route   POST /api/ai/soil-report
// @desc    Generate a Soil Report using Gemini AI
// @access  Public
router.post('/soil-report', aiController.generateSoilReport);

module.exports = router;
