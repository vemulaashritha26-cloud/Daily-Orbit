// Backend/services/aiService.js
const mode = (process.env.AI_MODE || "offline").toLowerCase();

function loadEngine(name) {
  if (name === "openai") return require("../aiEngines/openaiAI");
  if (name === "gemini") return require("../aiEngines/geminiAI");
  return require("../aiEngines/mockAI");
}

const engine = loadEngine(mode);

async function withFallback(fnName, ...args) {
  try {
    if (!engine[fnName]) throw new Error(`Engine missing method: ${fnName}`);
    return await engine[fnName](...args);
  } catch (err) {
    console.error(`AI Engine [${mode}] error in ${fnName}:`, err && (err.message || err));
    if (mode !== "offline") {
      try {
        const mock = require("../aiEngines/mockAI");
        if (mock[fnName]) return await mock[fnName](...args);
      } catch (mErr) {
        console.error("Mock fallback failed:", mErr && (mErr.message || mErr));
      }
    }
    return null;
  }
}

module.exports = {
  getSuggestions: (...args) => withFallback("getSuggestions", ...args),
  analyzeImage: (...args) => withFallback("analyzeImage", ...args),
  getMoodAdvice: (...args) => withFallback("getMoodAdvice", ...args),
  classifyTask: (...args) => withFallback("classifyTask", ...args),
  getSummary: (...args) => withFallback("getSummary", ...args),
  getTips: (...args) => withFallback("getTips", ...args)
};
