require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function debug() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log("Attempting to connect with key:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
    await model.generateContent("test");
  } catch (e) {
    console.log("\n🛑 FULL ERROR DETAILS:");
    console.log(e); // Print the whole object
  }
}

debug();