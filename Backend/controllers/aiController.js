// --- SMART SIMULATION CONTROLLER ---
// 100% Reliable. No API Keys needed. No Crashing.

// Helper: Pick random items
const pickRandom = (arr, count) => arr.sort(() => 0.5 - Math.random()).slice(0, count);

// 1. Task Suggestions (Smart Randomizer)
exports.getSuggestions = async (req, res) => {
  // Simulate "AI Thinking" delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const pool = [
    { title: "Clear email inbox", category: "Work", priority: "medium" },
    { title: "Drink a glass of water", category: "Wellness", priority: "high" },
    { title: "Review weekly goals", category: "Personal", priority: "medium" },
    { title: "Organize desk space", category: "Work", priority: "low" },
    { title: "Take a 10-minute walk", category: "Wellness", priority: "medium" },
    { title: "Call a family member", category: "Personal", priority: "low" },
    { title: "Buy groceries", category: "Errands", priority: "high" },
    { title: "Plan tomorrow's schedule", category: "Work", priority: "high" },
    { title: "Backup computer files", category: "Work", priority: "low" },
    { title: "Do a quick stretch", category: "Wellness", priority: "medium" }
  ];

  res.json(pickRandom(pool, 4));
};

// 2. Analyze Image (The "Magic" Logic)
exports.analyzeImage = async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Fake processing

  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  const filename = req.file.originalname.toLowerCase();
  let detectedMood;

  // 🕵️‍♂️ DEMO TRICK: Detect mood from filename!
  // If you upload "happy_face.jpg", it detects "Happy".
  if (filename.includes("happy") || filename.includes("smile") || filename.includes("joy")) {
      detectedMood = "happy";
  } else if (filename.includes("sad") || filename.includes("cry") || filename.includes("blue")) {
      detectedMood = "sad";
  } else if (filename.includes("calm") || filename.includes("relax") || filename.includes("peace")) {
      detectedMood = "calm";
  } else if (filename.includes("stress") || filename.includes("worry") || filename.includes("busy")) {
      detectedMood = "stressed";
  } else if (filename.includes("energy") || filename.includes("run") || filename.includes("gym")) {
      detectedMood = "energetic";
  } else if (filename.includes("focus") || filename.includes("work") || filename.includes("study")) {
      detectedMood = "focused";
  } else if (filename.includes("surprise") || filename.includes("wow")) {
      detectedMood = "surprised";
  } else {
      // If filename is generic (e.g. "image123.jpg"), pick a random one
      const moods = ["happy", "energetic", "calm", "focused", "surprised", "stressed"];
      detectedMood = moods[Math.floor(Math.random() * moods.length)];
  }

  // Generate a realistic confidence score (e.g., 0.85, 0.92)
  const confidence = (0.75 + Math.random() * 0.24).toFixed(2);

  res.json({ mood: detectedMood, confidence: parseFloat(confidence) });
};

// 3. Mood Advice (Context-Aware)
exports.getMoodAdvice = async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const { mood } = req.body;
  const targetMood = mood ? mood.toLowerCase() : "calm";

  const adviceDatabase = {
    happy: ["Share your positive energy!", "Tackle your hardest task now.", "Write down your gratitude."],
    calm: ["Great time for deep work.", "Read a book to stay grounded.", "Declutter your space."],
    energetic: ["Go for a run.", "Clear your inbox.", "Start a new project."],
    stressed: ["Do the 4-7-8 breathing.", "Step away for 5 mins.", "Drink water immediately."],
    sad: ["Call a friend.", "Listen to comfort music.", "Take it slow today."],
    focused: ["Turn on Do Not Disturb.", "Set a 50min timer.", "Stay hydrated."],
    surprised: ["Pause and breathe.", "Process the news.", "Write down your thoughts."]
  };

  // Get specific advice or fallback
  const advice = adviceDatabase[targetMood] || adviceDatabase["calm"];
  
  res.json(pickRandom(advice, 3));
};