const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  // The emotion (happy, sad, energetic, etc.)
  mood: { 
    type: String, 
    required: [true, 'Please select a mood'] 
  },
  // The emoji character (😊, 😔, etc.)
  emoji: {
    type: String,
    required: true
  },
  // Optional text notes
  notes: { 
    type: String 
  },
  // Timestamp for when it was logged
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Mood', MoodSchema);