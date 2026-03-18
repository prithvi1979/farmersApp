const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

// Public: Fetch products (with optional ?plants= and ?category= filters)
router.get('/products', marketController.getProducts);

// Admin CRUD
router.post('/products', marketController.createProduct);
router.get('/products/:id', marketController.getProductById);
router.put('/products/:id', marketController.updateProduct);
router.delete('/products/:id', marketController.deleteProduct);

module.exports = router;
