const cloudinary = require('cloudinary').v2;

// Cloudinary is auto-configured from CLOUDINARY_URL env variable
// (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)

/**
 * POST /api/admin/upload-image
 * Accepts a single image file (via multer), uploads to Cloudinary, returns the secure URL.
 */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Convert buffer to base64 data URI for Cloudinary SDK upload
    const base64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'farmersApp/news',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 500, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ success: false, error: 'Image upload failed' });
  }
};
