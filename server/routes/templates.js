const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const nodeHtmlToImage = require('node-html-to-image');
const Template = require('../models/Template');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|html/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images and HTML files only!');
    }
  }
});

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().sort({ likes: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload a new template
router.post('/', upload.fields([
  { name: 'html', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.html) {
      return res.status(400).json({ message: 'Missing HTML file' });
    }

    const htmlContent = await fs.readFile(req.files.html[0].path, 'utf8');
    let thumbnailPath;

    // Check if we need to auto-generate the thumbnail
    if (req.body.autoGenerateThumbnail === 'true') {
      // Generate a filename for the thumbnail
      const thumbnailFilename = `${Date.now()}-auto-thumbnail.png`;
      thumbnailPath = `/uploads/${thumbnailFilename}`;
      const fullThumbnailPath = path.join('public', thumbnailPath);
      
      // Generate the thumbnail using node-html-to-image
      await nodeHtmlToImage({
        output: fullThumbnailPath,
        html: htmlContent,
        type: 'png',
        transparent: false,
        puppeteerArgs: {
          defaultViewport: {
            width: 1200,
            height: 630,
            deviceScaleFactor: 1
          }
        }
      });
    } else if (req.files.thumbnail) {
      thumbnailPath = `/uploads/${req.files.thumbnail[0].filename}`;
    } else {
      return res.status(400).json({ message: 'Either provide a thumbnail or enable auto-generation' });
    }
    
    const template = new Template({
      name: req.body.name,
      html: htmlContent,
      thumbnail: thumbnailPath
    });

    const newTemplate = await template.save();
    res.status(201).json(newTemplate);
  } catch (err) {
    console.error('Template upload error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Like a template
router.put('/:id/like', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    template.likes += 1;
    await template.save();
    res.json(template);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.put('/:id/view', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    template.views += 1;
    await template.save();
    res.json(template);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = router;