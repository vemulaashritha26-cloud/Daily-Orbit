const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getSuggestions, analyzeImage, getMoodAdvice } = require('../controllers/aiController');

// Configure Multer (Store file in RAM)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define Routes
router.get('/suggestions', getSuggestions);
router.post('/analyze-image', upload.single('image'), analyzeImage); // 'image' must match frontend FormData
router.post('/advice', getMoodAdvice);

module.exports = router;