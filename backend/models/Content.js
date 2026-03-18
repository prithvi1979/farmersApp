const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String 
  },
  summary: {
    type: String // Short 1-2 line blurb shown in list cards
  },
  content: { 
    type: String, // The actual blog post article (HTML supported)
    required: true
  },
  category: { 
    type: String, 
    required: true,
    enum: ['diseases', 'pests', 'general', 'techniques', 'fertilizers', 'irrigation', 'seeds', 'weather', 'market', 'government-schemes']
  },
  tags: [{ 
    type: String // e.g., ['wheat', 'rust', 'fungicide']
  }],
  
  // --- LIFECYCLE ---
  isActive: { 
    type: Boolean, 
    default: true 
  },
  author: {
    type: String // Frontend-Admin creator
  },
  readTimeMinutes: {
    type: Number // Estimated reading time in minutes
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);
