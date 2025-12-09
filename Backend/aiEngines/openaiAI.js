// Backend/aiEngines/openaiAI.js
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

async function chat(prompt, options = {}) {
  const model = options.model || "gpt-3.5-turbo";
  if (client.chat && client.chat.completions && typeof client.chat.completions.create === "function") {
    const res = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 400
    });
    return res.choices[0].message.content;
  }
  // If client library differs, throw clear error
  throw new Error("OpenAI client API not supported by installed package. Confirm openai package version.");
}

module.exports = {
  async getSuggestions() {
    const prompt = `Generate 4 actionable task suggestions as a JSON array of objects with keys: title, category, priority. Output JSON only.`;
    const text = await chat(prompt);
    try { return JSON.parse(text); } catch(e) {
      const m = text.match(/\[.*\]/s);
      if (m) return JSON.parse(m[0]);
      throw e;
    }
  },

  async analyzeImage(filePart) {
    return { error: "OpenAI image/vision not implemented in this wrapper. Use offline or Gemini for vision." };
  },

  async getMoodAdvice(mood, extra = {}) {
    const prompt = `You are a friendly coach. Give 3 concise tips for someone feeling "${mood}". Output JSON array of strings.`;
    const text = await chat(prompt);
    try { return JSON.parse(text); } catch(e) {
      return text.split("\n").map(s=>s.trim()).filter(Boolean);
    }
  },

  async classifyTask(text) {
    const prompt = `Classify this task: "${text}". Output EXACT JSON: {"title":"...", "category":"Work|Study|Personal|Health", "priority":"low|medium|high"}`;
    const out = await chat(prompt);
    const m = out.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("OpenAI classifyTask parse error");
  },

  async getSummary(tasks = []) {
    const prompt = `Summarize this list in one short sentence: ${JSON.stringify(tasks)}`;
    const out = await chat(prompt);
    return { summary: out.trim() };
  },

  async getTips() {
    const prompt = "Give 4 short productivity tips as a JSON array of strings.";
    const out = await chat(prompt);
    try { return JSON.parse(out); } catch(e) { return out.split("\n").filter(Boolean); }
  }
};
