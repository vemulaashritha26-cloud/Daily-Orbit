const express = require('express');
const router = express.Router();
const { 
  getMoods, 
  createMood,
  clearMoods
} = require('../controllers/moodController');

// Define the API endpoints
router.route('/')
  .get(getMoods)      // GET /api/moods
  .post(createMood)   // POST /api/moods
  .delete(clearMoods); // DELETE /api/moods

module.exports = router;