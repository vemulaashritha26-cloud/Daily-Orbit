const Mood = require('../models/Mood');

// @desc    Get mood history
// @route   GET /api/moods
exports.getMoods = async (req, res) => {
  try {
    // Get last 50 moods, newest first
    const moods = await Mood.find().sort({ timestamp: -1 }).limit(50);
    res.status(200).json(moods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log a new mood
// @route   POST /api/moods
exports.createMood = async (req, res) => {
  try {
    const mood = await Mood.create(req.body);
    res.status(201).json(mood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Clear all moods (Optional utility)
// @route   DELETE /api/moods
exports.clearMoods = async (req, res) => {
  try {
    await Mood.deleteMany({});
    res.status(200).json({ message: 'Mood history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};