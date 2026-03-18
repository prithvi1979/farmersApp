const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String 
  }, // Optional full article text
  imageUrl: { 
    type: String 
  },
  source: { 
    type: String 
  }, // e.g., "Govt of Punjab", "Local Krishi Kendra"
  
  // --- TARGETING / FILTERING ---
  // If these are empty, everybody sees the news (Generic)
  targetState: { 
    type: String 
  }, 
  targetCity: { 
    type: String 
  }, 
  targetCrops: [{ 
    type: String 
  }], // e.g., ["Wheat", "Mustard"]
  
  // --- LIFECYCLE ---
  isActive: { 
    type: Boolean, 
    default: true 
  },
  publishedAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date 
  } // Automatically hide after a date 
}, {
  timestamps: true
});

module.exports = mongoose.model('News', newsSchema);
