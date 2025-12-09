const Task = require('../models/Task');
const Mood = require('../models/Mood');

// @desc    Get Dashboard Metrics
// @route   GET /api/analytics/summary
exports.getSummary = async (req, res) => {
  try {
    // 1. Count Tasks
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const activeTasks = await Task.countDocuments({ status: 'active' });
    
    // 2. Calculate Percentage (Avoid division by zero)
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // 3. Send Response
    res.json({
      total: totalTasks,
      completed: completedTasks,
      active: activeTasks,
      completionRate: completionRate
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};