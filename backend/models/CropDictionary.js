const mongoose = require('mongoose');

const cropDictionarySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CropDictionary', cropDictionarySchema);
