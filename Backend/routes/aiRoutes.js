// Backend/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// multer memory storage (for image upload)
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get("/suggestions", aiController.getSuggestions);
router.post("/mood-advice", express.json(), aiController.getMoodAdvice);
router.post("/analyze-image", upload.single("image"), aiController.analyzeImage);

module.exports = router;
