const mongoose = require('mongoose');

const masterCropSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: { 
    type: String 
  },
  totalDurationDays: { 
    type: Number 
  },
  imageUrl: { 
    type: String 
  },
  
  // The master template built by Admins in the React App
  timelineTemplate: [
    {
      phase: { type: String, required: true },
      day: { type: Number, required: true },
      title: { type: String, required: true },
      instructions: { type: String },
      taskType: { 
        type: String, 
        enum: ['fertilizer', 'irrigation', 'general', 'harvest', 'pesticide', 'sowing'],
        default: 'general'
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('MasterCrop', masterCropSchema);
