const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Define API Routes
router.get('/news', contentController.getNews);
router.get('/library', contentController.getLibraryContent);

module.exports = router;
