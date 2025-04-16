const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const nodeHtmlToImage = require('node-html-to-image');
const Template = require('../models/Template');

// Configure multer for memory storage (not saving to disk)
const storage = multer.memoryStorage();
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
      cb(new Error('Error: Images and HTML files only!'));
    }
  }
});

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().select('-html -thumbnail').sort({ likes: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get HTML content for a template
router.get('/:id/html', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).select('html');
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.set('Content-Type', 'text/html');
    res.send(template.html);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get thumbnail for a template
router.get('/:id/thumbnail', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).select('thumbnail thumbnailType');
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.set('Content-Type', template.thumbnailType);
    res.send(template.thumbnail);
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

    
    const htmlContent = req.files.html[0].buffer.toString('utf8');
    let thumbnailBuffer;
    let thumbnailType;

    
    if (req.body.autoGenerateThumbnail === 'true') {

      thumbnailBuffer = await nodeHtmlToImage({
        html: htmlContent,
        type: 'png',
        transparent: false,
        puppeteerArgs: {
          defaultViewport: {
            width: 1200,
            height: 630,
            deviceScaleFactor: 1
          }
        },
        encoding: 'binary'
      });
      thumbnailType = 'image/png';
    } else if (req.files.thumbnail) {
      thumbnailBuffer = req.files.thumbnail[0].buffer;
      thumbnailType = req.files.thumbnail[0].mimetype;
    } else {
      return res.status(400).json({ message: 'Either provide a thumbnail or enable auto-generation' });
    }
    
    const template = new Template({
      name: req.body.name,
      html: htmlContent,
      thumbnail: thumbnailBuffer,
      thumbnailType: thumbnailType,
      likes: 0,
      views: 0
    });

    const newTemplate = await template.save();
   
    const templateResponse = {
      _id: newTemplate._id,
      name: newTemplate.name,
      likes: newTemplate.likes,
      views: newTemplate.views,
      createdAt: newTemplate.createdAt
    };
    
    res.status(201).json(templateResponse);
  } catch (err) {
    console.error('Template upload error:', err);
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/like', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).select('-html -thumbnail');
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    template.likes += 1;
    await template.save();
    res.json(template);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/view', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).select('-html -thumbnail');
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    template.views += 1;
    await template.save();
    res.json(template);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;