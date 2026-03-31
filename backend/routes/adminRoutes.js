const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');

// Define API Routes for Admin Panel
router.post('/login', adminController.loginAdmin);

router.get('/stats', adminController.getDashboardStats);

router.post('/master-crops', adminController.createMasterCrop);
router.get('/master-crops', adminController.getAllMasterCrops);
router.get('/master-crops/:id', adminController.getMasterCropById);
router.put('/master-crops/:id', adminController.updateMasterCrop);
router.delete('/master-crops/:id', adminController.deleteMasterCrop);

router.post('/news', adminController.createNews);
router.get('/news', adminController.getAllNews);
router.get('/news/:id', adminController.getNewsById);
router.put('/news/:id', adminController.updateNews);
router.delete('/news/:id', adminController.deleteNews);

router.post('/library', adminController.createLibraryArticle);
router.get('/library', adminController.getAllLibraryArticles);
router.get('/library/:id', adminController.getLibraryArticleById);
router.put('/library/:id', adminController.updateLibraryArticle);
router.delete('/library/:id', adminController.deleteLibraryArticle);

router.post('/market', adminController.createProduct);

// Image upload (Cloudinary)
router.post('/upload-image', upload.single('image'), uploadController.uploadImage);

module.exports = router;
