const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// Helper: Clean JSON response
const cleanAndParseJSON = (text) => {
  try {
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // Attempt to extract JSON object or array
    const firstBrace = cleanText.search(/(\{|\[)/);
    const lastBrace = cleanText.search(/(\}|\])[^}]*$/);
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON Parse Error:", text);
    return null;
  }
};

// 1. Real Task Suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate 4 actionable task suggestions. Output ONLY raw JSON array: [{"title": "Task", "category": "Work", "priority": "high"}]`;
    const result = await model.generateContent(prompt);
    const data = cleanAndParseJSON(result.response.text());
    res.json(data || []);
  } catch (error) {
    console.error("AI Task Error:", error.message);
    res.json([]); 
  }
};

// 2. Real Image Analysis
exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    // Use Flash model for vision
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imagePart = fileToGenerativePart(req.file.buffer, req.file.mimetype);
    const prompt = `Analyze the facial expression or vibe of this image. Return JSON: {"mood": "happy", "confidence": 0.9}. Valid moods: happy, calm, energetic, stressed, sad, focused, surprised.`;

    const result = await model.generateContent([prompt, imagePart]);
    const data = cleanAndParseJSON(result.response.text());

    if (data && data.mood) {
      data.mood = data.mood.toLowerCase();
      res.json(data);
    } else {
      throw new Error("AI could not detect mood");
    }
  } catch (error) {
    console.error("Vision Error:", error.message);
    res.status(500).json({ message: "AI Analysis Failed" });
  }
};

// 3. Mood Advice
exports.getMoodAdvice = async (req, res) => {
  try {
    const { mood } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `User feels "${mood}". Give 3 short tips. Output raw JSON string array.`;
    const result = await model.generateContent(prompt);
    const data = cleanAndParseJSON(result.response.text());
    res.json(data || ["Take a deep breath", "Drink water"]);
  } catch (error) {
    res.json(["Take a break", "Rest your eyes"]);
  }
};