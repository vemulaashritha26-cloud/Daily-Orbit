require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testConnection() {
  console.log("----- DEBUGGING AI CONNECTION -----");
  
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("❌ ERROR: API Key is MISSING. Check your .env file.");
    return;
  }
  console.log(`✅ API Key Found: ${key.substring(0, 5)}...*******`);

  try {
    const genAI = new GoogleGenerativeAI(key);
    // Use gemini-pro as the baseline test
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    console.log("⏳ Sending test request to Google...");
    const result = await model.generateContent("Say 'Hello' if you can hear me.");
    const response = await result.response;
    
    console.log("🎉 SUCCESS! AI Replied:", response.text());
  } catch (error) {
    console.error("❌ CONNECTION FAILED:");
    console.error("Error Message:", error.message);
  }
}

testConnection();