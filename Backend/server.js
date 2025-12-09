const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config(); // Load .env for API Key

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
const connectDB = async () => {
  try {
    // Use local or cloud URI
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dailyorbit_db');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../Frontend')));

// Import Routes
const taskRoutes = require('./routes/tasks');
const moodRoutes = require('./routes/moods');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes'); // <-- Real AI Routes
const analyticsRoutes = require('./routes/analyticsRoutes');

// Mount Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes); // <-- Connected here
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
  console.log(`\n🚀 Daily Orbit Server running on http://localhost:${PORT}`);
  console.log(`   - Dashboard: http://localhost:${PORT}/dashboard.html`);
});