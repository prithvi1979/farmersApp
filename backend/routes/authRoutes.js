const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/google', authController.googleSignIn);
router.patch('/profile', authController.updateProfile);

module.exports = router;
