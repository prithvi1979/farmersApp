const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mediaUrl: { type: String },
  requiredMaterials: [{ type: String }],
  taskType: { 
    type: String, 
    enum: ['fertilizer', 'irrigation', 'general', 'harvest', 'pesticide', 'sowing'],
    default: 'general'
  },
  order: { type: Number, required: true }
});

const phaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  tasks: [taskSchema]
});

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
  phases: [phaseSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('MasterCrop', masterCropSchema);
