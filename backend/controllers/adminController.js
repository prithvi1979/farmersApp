const MasterCrop = require('../models/MasterCrop');
const News = require('../models/News');
const Content = require('../models/Content');
const Product = require('../models/Product');
const User = require('../models/User');
const ActiveCrop = require('../models/ActiveCrop');
const Post = require('../models/Post');

// POST /api/admin/login
// Purpose: Verifies the hardcoded admin username and password from .env
exports.loginAdmin = async (req, res) => {
    try {
        console.log("LOGIN ATTEMPT RECEIVED:", req.body);
        const { username, password } = req.body;
        
        console.log("ENV Username:", process.env.ADMIN_USERNAME);
        console.log("ENV Password:", process.env.ADMIN_PASSWORD);
        
        // Compare against .env variables
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            console.log("Credentials matched!");
            // In a production app you'd return a JWT token here. 
            // For this admin panel, returning a success flag is enough for the React state.
            return res.status(200).json({ success: true, message: 'Login successful', token: 'admin-secret-token' });
        } else {
            console.log("Credentials did NOT match.");
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('CRITICAL ERROR logging in admin:', error);
        res.status(500).json({ success: false, error: 'Server error during login', details: error.message });
    }
};

// GET /api/admin/stats
// Purpose: Quick overview numbers for the Admin Dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeCrops = await ActiveCrop.countDocuments({ status: 'active' });
        const totalPosts = await Post.countDocuments();
        const totalProducts = await Product.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeCrops,
                totalPosts,
                totalProducts
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
};

// POST /api/admin/master-crops
// Purpose: Create a new MasterCrop timeline
exports.createMasterCrop = async (req, res) => {
    try {
        const { name, description, totalDurationDays, imageUrl, timelineTemplate } = req.body;
        
        if (!name || !timelineTemplate) {
            return res.status(400).json({ success: false, error: 'Name and timeline template are required' });
        }

        const newCrop = new MasterCrop({
            name,
            description,
            totalDurationDays,
            imageUrl,
            timelineTemplate
        });

        await newCrop.save();
        res.status(201).json({ success: true, data: newCrop });
    } catch (error) {
        console.error('Error creating MasterCrop:', error);
        res.status(500).json({ success: false, error: 'Failed to create MasterCrop' });
    }
};

// GET /api/admin/master-crops
// Purpose: Fetch all master crops (the frontend usually needs this for table views)
exports.getAllMasterCrops = async (req, res) => {
     try {
        const crops = await MasterCrop.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: crops });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch MasterCrops' });
    }
};

// POST /api/admin/news
// Purpose: Publish a targeted news article
exports.createNews = async (req, res) => {
    try {
        const newsData = req.body; // Expects title, description, targetState, targetCity, targetCrops, etc.
        const news = new News(newsData);
        await news.save();
        res.status(201).json({ success: true, data: news });
    } catch (error) {
         console.error('Error creating News:', error);
         res.status(500).json({ success: false, error: 'Failed to create News' });
    }
};

// POST /api/admin/library
// Purpose: Publish a library article (disease, pest, technique)
exports.createLibraryArticle = async (req, res) => {
    try {
        const articleData = req.body; // Expects title, content, category, tags
        const article = new Content(articleData);
        await article.save();
        res.status(201).json({ success: true, data: article });
    } catch (error) {
         console.error('Error creating Library Article:', error);
         res.status(500).json({ success: false, error: 'Failed to create Article' });
    }
};

// GET /api/admin/library
// Purpose: Fetch all library articles (admin view)
exports.getAllLibraryArticles = async (req, res) => {
    try {
        const articles = await Content.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: articles });
    } catch (error) {
        console.error('Error fetching library articles:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch articles' });
    }
};

// GET /api/admin/library/:id
// Purpose: Fetch a single library article by ID
exports.getLibraryArticleById = async (req, res) => {
    try {
        const article = await Content.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }
        res.status(200).json({ success: true, data: article });
    } catch (error) {
        console.error('Error fetching library article:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch article' });
    }
};

// PUT /api/admin/library/:id
// Purpose: Update a library article
exports.updateLibraryArticle = async (req, res) => {
    try {
        const article = await Content.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }
        res.status(200).json({ success: true, data: article });
    } catch (error) {
        console.error('Error updating library article:', error);
        res.status(500).json({ success: false, error: 'Failed to update article' });
    }
};

// DELETE /api/admin/library/:id
// Purpose: Delete a library article
exports.deleteLibraryArticle = async (req, res) => {
    try {
        const article = await Content.findByIdAndDelete(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }
        res.status(200).json({ success: true, message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting library article:', error);
        res.status(500).json({ success: false, error: 'Failed to delete article' });
    }
};

// POST /api/admin/market
// Purpose: Add a new affiliate product
exports.createProduct = async (req, res) => {
    try {
        const productData = req.body; // Expects title, desc, price, affiliateLink, targetPlants
        const product = new Product(productData);
        await product.save();
        res.status(201).json({ success: true, data: product });
    } catch (error) {
         console.error('Error creating Product:', error);
         res.status(500).json({ success: false, error: 'Failed to create Product' });
    }
};

// GET /api/admin/master-crops/:id
// Purpose: Fetch a single MasterCrop by ID
exports.getMasterCropById = async (req, res) => {
    try {
        const crop = await MasterCrop.findById(req.params.id);
        if (!crop) {
            return res.status(404).json({ success: false, error: 'MasterCrop not found' });
        }
        res.status(200).json({ success: true, data: crop });
    } catch (error) {
        console.error('Error fetching MasterCrop:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch MasterCrop' });
    }
};

// PUT /api/admin/master-crops/:id
// Purpose: Update a master crop timeline 
exports.updateMasterCrop = async (req, res) => {
    try {
        const { name, description, totalDurationDays, imageUrl, timelineTemplate } = req.body;
        
        if (!name || !timelineTemplate) {
            return res.status(400).json({ success: false, error: 'Name and timeline template are required' });
        }

        const crop = await MasterCrop.findByIdAndUpdate(
            req.params.id,
            { name, description, totalDurationDays, imageUrl, timelineTemplate },
            { new: true, runValidators: true }
        );

        if (!crop) {
            return res.status(404).json({ success: false, error: 'MasterCrop not found' });
        }

        res.status(200).json({ success: true, data: crop });
    } catch (error) {
        console.error('Error updating MasterCrop:', error);
        res.status(500).json({ success: false, error: 'Failed to update MasterCrop' });
    }
};

// DELETE /api/admin/master-crops/:id
// Purpose: Delete a master crop template
exports.deleteMasterCrop = async (req, res) => {
    try {
        const crop = await MasterCrop.findByIdAndDelete(req.params.id);
        
        if (!crop) {
            return res.status(404).json({ success: false, error: 'MasterCrop not found' });
        }

        res.status(200).json({ success: true, message: 'MasterCrop deleted successfully' });
    } catch (error) {
        console.error('Error deleting MasterCrop:', error);
        res.status(500).json({ success: false, error: 'Failed to delete MasterCrop' });
    }
};

// GET /api/admin/news
// Purpose: Fetch all news articles (admin view, no filters)
exports.getAllNews = async (req, res) => {
    try {
        const articles = await News.find().sort({ publishedAt: -1 });
        res.status(200).json({ success: true, data: articles });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch news' });
    }
};

// GET /api/admin/news/:id
// Purpose: Fetch a single news article by ID
exports.getNewsById = async (req, res) => {
    try {
        const article = await News.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }
        res.status(200).json({ success: true, data: article });
    } catch (error) {
        console.error('Error fetching news article:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch article' });
    }
};

// PUT /api/admin/news/:id
// Purpose: Update an existing news article
exports.updateNews = async (req, res) => {
    try {
        const article = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }

        res.status(200).json({ success: true, data: article });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ success: false, error: 'Failed to update news' });
    }
};

// DELETE /api/admin/news/:id
// Purpose: Delete a news article
exports.deleteNews = async (req, res) => {
    try {
        const article = await News.findByIdAndDelete(req.params.id);

        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }

        res.status(200).json({ success: true, message: 'News article deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ success: false, error: 'Failed to delete news' });
    }
};