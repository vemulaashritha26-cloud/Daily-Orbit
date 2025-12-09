const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config(); // Load .env variables
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. Connect to Database (Dynamic) ---
// This now uses the value from your .env file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// --- 2. Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- 3. Serve Frontend ---
app.use(express.static(path.join(__dirname, '../Frontend')));

// --- 4. Import Routes ---
// Make sure these files exist in your routes folder!
const taskRoutes = require('./routes/tasks');
const moodRoutes = require('./routes/moods');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// --- 5. Mount Routes ---
app.use('/api/tasks', taskRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- 6. Start Server ---
app.listen(PORT, () => {
  console.log(`\n🚀 Daily Orbit Server running on http://localhost:${PORT}`);
  console.log(`   - Dashboard: http://localhost:${PORT}/dashboard.html`);
  
  // Optional: Auto-open browser (remove this line if it causes issues on Render)
  // exec(`start http://localhost:${PORT}/index.html`, (err) => {}); 
});