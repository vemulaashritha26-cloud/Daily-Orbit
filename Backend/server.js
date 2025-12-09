const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv').config(); // Load .env variables
const connectDB = require('./config/database');
const { exec } = require('child_process'); 

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Connect to Database
connectDB();

// 2. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debugging Logger (Optional: prints requests to terminal)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// 3. Serve Frontend
app.use(express.static(path.join(__dirname, '../Frontend')));

// 4. Import Routes
const taskRoutes = require('./routes/tasks');
const moodRoutes = require('./routes/moods');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// 5. Mount Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// in server.js (example)

// 6. Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Daily Orbit Server running on http://localhost:${PORT}`);
  console.log(`   - Login: http://localhost:${PORT}/index.html`);
  
  // Open the Login page automatically
  exec(`start http://localhost:${PORT}/index.html`, (err) => {}); 
});