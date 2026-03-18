const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  affiliateLink: { 
    type: String, 
    required: true 
  },
  
  // --- FILTERING DATA ---
  targetPlants: [{ 
    type: String 
  }], // E.g., ['Tomato', 'Potato']. Empty array = generic product for everyone
  category: { 
    type: String, 
    enum: ['fertilizer', 'tools', 'seeds', 'pesticide', 'irrigation', 'general'],
    default: 'general'
  },

  // --- UI/LIFECYCLE ---
  isActive: { 
    type: Boolean, 
    default: true 
  },
  views: { 
    type: Number, 
    default: 0 
  }, // Track impressions
  clicks: { 
    type: Number, 
    default: 0 
  } // Track outbound clicks
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
