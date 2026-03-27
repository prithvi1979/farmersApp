const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  authorId: { 
    type: String, 
    required: true,
    index: true 
  },
  authorName: { 
    type: String 
  },
  authorPhoto: {
    type: String
  },
  
  question: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String 
  },
  
  // -- TARGETING & SEARCH --
  cropTag: { 
    type: String 
  }, // e.g., 'Tomato'
  state: { 
    type: String,
    index: true
  }, // Automatically added from User's profile if possible
  
  upvotes: [{ 
    type: String 
  }], // Array of deviceIds
  
  answers: [
    {
      authorId: { type: String, required: true },
      authorName: { type: String },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  
  status: { 
    type: String, 
    enum: ['open', 'resolved', 'hidden'], 
    default: 'open' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
