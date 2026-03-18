const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// Define API Routes
router.get('/posts', communityController.getPosts);
router.post('/post', communityController.createPost);

module.exports = router;
