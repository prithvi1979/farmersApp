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

module.exports = router;
