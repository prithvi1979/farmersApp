const mongoose = require('mongoose');

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

  // Personalized checklist
  dailyTasks: [
    {
      taskId: { 
        type: String, 
        required: true 
      }, // Unique identifier for this specific instance of the task
      title: { type: String },
      instructions: { type: String },
      taskType: { type: String }, 
      phase: { type: String },
      targetDay: { type: Number },
      dueDate: { type: Date }, // Automatically calculated: startDate + (targetDay * 24h)
      isCompleted: { 
        type: Boolean, 
        default: false 
      },
      completedAt: { type: Date }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('ActiveCrop', activeCropSchema);
