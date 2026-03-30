const mongoose = require('mongoose');

const activeTaskSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId }, // Reference to MasterCrop task ID
  title: { type: String },
  description: { type: String },
  mediaUrl: { type: String },
  requiredMaterials: [{ type: String }],
  taskType: { type: String },
  order: { type: Number },
  status: { 
    type: String, 
    enum: ['locked', 'pending', 'completed'], 
    default: 'locked' 
  },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const activePhaseSchema = new mongoose.Schema({
  phaseId: { type: mongoose.Schema.Types.ObjectId }, // Reference to MasterCrop phase ID
  name: { type: String },
  order: { type: Number },
  durationDays: { type: Number },
  status: { 
    type: String, 
    enum: ['locked', 'in_progress', 'completed'], 
    default: 'locked' 
  },
  startDate: { type: Date },
  expectedEndDate: { type: Date },
  tasks: [activeTaskSchema]
});

const activeCropSchema = new mongoose.Schema({
  deviceId: { 
    type: String, 
    required: true, 
    index: true 
  },
  cropId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MasterCrop' 
  },
  cropName: { 
    type: String 
  },
  startDate: { 
    type: Date, 
    default: Date.now 
  }, 
  totalArea: {
    type: Number
  },
  areaUnit: {
    type: String,
    enum: ['acres', 'hectares', 'sq_meters']
  },
  farmingMethod: {
    type: String,
    enum: ['organic', 'conventional', 'hydroponic', 'other']
  },
  soilType: {
    type: String
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'harvested', 'cancelled'], 
    default: 'active' 
  },
  phases: [activePhaseSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('ActiveCrop', activeCropSchema);
