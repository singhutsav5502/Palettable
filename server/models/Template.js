const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  html: {
    type: String,  
    required: true
  },
  thumbnail: {
    type: Buffer,  
    required: true
  },
  thumbnailType: {
    type: String, 
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Template', TemplateSchema);