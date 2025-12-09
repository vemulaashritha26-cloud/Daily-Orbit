const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Work', 'Personal', 'Wellness', 'Errands', 'Birthday', 'Anniversary', 'Meeting'], 
    default: 'Personal' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  // 🌟 NEW FIELD: FREQUENCY
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly'],
    default: 'once'
  },
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active' 
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);