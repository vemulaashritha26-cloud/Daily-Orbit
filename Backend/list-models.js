require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("🔍 Checking available models...");

  try {
    // This connects to Google and asks "What can I use?"
    const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    // Note: We just need an instance to access the API manager, 
    // usually there isn't a direct "list models" function exposed easily in the basic simplified client 
    // without using the direct fetch or the specific admin SDK.
    
    // WORKAROUND: We will try the most common modern names one by one.
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-1.5-flash-latest"
    ];

    for (const name of candidates) {
        process.stdout.write(`Testing ${name}... `);
        try {
            const model = genAI.getGenerativeModel({ model: name });
            await model.generateContent("Hi");
            console.log("✅ WORKS!");
            console.log(`\n🎉 SOLUTION: Change your code to use model: "${name}"`);
            return; // We found a winner!
        } catch (e) {
            console.log("❌ Failed (" + e.message.split('[')[0].trim() + ")");
        }
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkModels();