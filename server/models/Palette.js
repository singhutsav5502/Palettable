const mongoose = require('mongoose');

const PaletteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: () => `Palette ${Date.now().toString().slice(-6)}`
  },
  colors: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 3 && arr.length <= 6, 'Palette must have 3-6 colors']
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

module.exports = mongoose.model('Palette', PaletteSchema);

