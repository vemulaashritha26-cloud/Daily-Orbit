const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProfile, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Import middleware

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes (User must be logged in)
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUser);

module.exports = router;