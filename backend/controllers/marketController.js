const Product = require('../models/Product');

// ─── GET /api/market/products ────────────────────────────────────────────────
// Fetches affiliate products with optional ?plants= and ?category= filters
exports.getProducts = async (req, res) => {
  try {
    const { plants, category } = req.query;

    // Admin can pass ?all=true to bypass targeting and isActive filter
    const showAll = req.query.all === 'true';

    if (showAll) {
      const adminFilter = {};
      if (category) adminFilter.category = category.toLowerCase();
      const products = await Product.find(adminFilter).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: products.length, data: products });
    }

    // ── Public farmer-facing logic ──
    let userPlants = [];
    if (plants) {
      userPlants = plants.split(',').map(p => p.trim());
    }

    const baseFilter = { isActive: true };
    if (category) {
      baseFilter.category = category.toLowerCase();
    }

    const finalQuery = { ...baseFilter };
    if (userPlants.length > 0) {
      finalQuery.$or = [
        { targetPlants: { $in: userPlants } },
        { $or: [{ targetPlants: { $exists: false } }, { targetPlants: { $size: 0 } }] },
      ];
    }
    let products = await Product.find(finalQuery).sort({ createdAt: -1 });

    if (userPlants.length > 0) {
      products.sort((a, b) => {
        const aMatches = a.targetPlants.some(p => userPlants.includes(p)) ? 1 : 0;
        const bMatches = b.targetPlants.some(p => userPlants.includes(p)) ? 1 : 0;
        return bMatches - aMatches;
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      filteredByCrops: userPlants,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching market products:', error);
    res.status(500).json({ success: false, error: 'Server error fetching products' });
  }
};

// ─── POST /api/market/products ───────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const { title, price, description, imageUrl, affiliateLink, category, targetPlants, isActive } = req.body;

    if (!title || !price || !description || !imageUrl || !affiliateLink) {
      return res.status(400).json({ success: false, error: 'title, price, description, imageUrl and affiliateLink are required.' });
    }

    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      affiliateLink,
      category: category || 'general',
      targetPlants: Array.isArray(targetPlants) ? targetPlants : [],
      isActive: isActive !== undefined ? isActive : true,
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: 'Server error creating product' });
  }
};

// ─── GET /api/market/products/:id ───────────────────────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, error: 'Server error fetching product' });
  }
};

// ─── PUT /api/market/products/:id ───────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const { title, price, description, imageUrl, affiliateLink, category, targetPlants, isActive } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (affiliateLink !== undefined) updateData.affiliateLink = affiliateLink;
    if (category !== undefined) updateData.category = category;
    if (targetPlants !== undefined) updateData.targetPlants = Array.isArray(targetPlants) ? targetPlants : [];
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: 'Server error updating product' });
  }
};

// ─── DELETE /api/market/products/:id ────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: 'Server error deleting product' });
  }
};
