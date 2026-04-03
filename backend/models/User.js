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
  // OAuth fields
  email: { type: String, unique: true, sparse: true },
  oauthProvider: { type: String, enum: ['google', null], default: null },
  oauthId: { type: String, unique: true, sparse: true },

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

  // --- SOIL TEST ---
  soilTest: {
    ph: { type: Number },
    texture: { type: String, enum: ['sand', 'silt', 'clay', 'loam', 'heavy_clay'] },
    drainageTime: { type: String, enum: ['fast', 'ideal', 'slow'] },
    organicMatter: { type: String, enum: ['low', 'medium', 'high'] },
    npk: {
      nitrogen: { type: String, enum: ['low', 'medium', 'high'] },
      phosphorus: { type: String, enum: ['low', 'medium', 'high'] },
      potassium: { type: String, enum: ['low', 'medium', 'high'] }
    },
    lastTestedOn: { type: Date }
  },

  // --- REGISTERED PROFILE ---
  name: { type: String },
  phoneNumber: { 
    type: String, 
    unique: true, 
    sparse: true // Allows multiple nulls for guests
  },
  photoUrl: { type: String },
  pin: { type: String }, // 4 digit pass code

}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
