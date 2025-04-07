require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const paletteRoutes = require('./routes/palettes');
const templateRoutes = require('./routes/templates');

app.use('/api/palettes', paletteRoutes);
app.use('/api/templates', templateRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
