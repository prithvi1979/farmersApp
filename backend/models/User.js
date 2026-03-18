const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // --- IDENTIFICATION ---
  deviceId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  status: { 
    type: String, 
    enum: ['guest', 'registered'], 
    default: 'guest' 
  },

  // --- ONBOARDING PREFERENCES ---
  language: { 
    type: String, 
    default: 'en' 
  },
  persona: { 
    type: String 
  },
  chosenPlants: [{ 
    type: String 
  }],

  // --- LOCATION & WEATHER (Auto-captured) ---
  ipAddress: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String },
    state: { type: String }
  },

  // --- FARM PROFILE ---
  farmInfo: {
    totalArea: { type: Number },
    areaUnit: { 
      type: String, 
      enum: ['acre', 'hectare', 'sqMeter'], 
      default: 'acre' 
    },
    primarySoilType: { 
      type: String, 
      enum: ['clay', 'sandy', 'loam', 'silt'] 
    }
  },

  // --- REGISTERED PROFILE ---
  name: { type: String },
  phoneNumber: { 
    type: String, 
    unique: true, 
    sparse: true // Allows multiple nulls for guests
  },
  photoUrl: { type: String },

}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
