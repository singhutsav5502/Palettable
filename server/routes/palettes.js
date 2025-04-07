const express = require('express');
const router = express.Router();
const Palette = require('../models/Palette');

// Get all palettes (sorted by likes)
router.get('/', async (req, res) => {
  try {
    const palettes = await Palette.find().sort({ likes: -1 });
    res.json(palettes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new palette
router.post('/', async (req, res) => {
  const palette = new Palette({
    name: req.body.name,
    colors: req.body.colors
  });

  try {
    const newPalette = await palette.save();
    res.status(201).json(newPalette);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Like a palette
router.put('/:id/like', async (req, res) => {
  try {
    const palette = await Palette.findById(req.params.id);
    palette.likes += 1;
    await palette.save();
    res.json(palette);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Increment view count
router.put('/:id/view', async (req, res) => {
  try {
    const palette = await Palette.findById(req.params.id);
    palette.views += 1;
    await palette.save();
    res.json(palette);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;