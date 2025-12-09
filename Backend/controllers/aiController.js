// --- SIMULATION AI CONTROLLER (Robust Offline Mode) ---

// Helper: Pick random items from an array
const pickRandom = (arr, count) => arr.sort(() => 0.5 - Math.random()).slice(0, count);

// 1. Task Suggestions (Smart Randomizer)
exports.getSuggestions = async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Fake "thinking" delay

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
    { title: "Do a quick stretch", category: "Wellness", priority: "medium" },
    { title: "Update budget tracker", category: "Personal", priority: "high" }
  ];

  res.json(pickRandom(pool, 4));
};

// 2. Analyze Image (Simulated Vision)
exports.analyzeImage = async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); 

  if (!req.file) return res.status(400).json({ message: "No image uploaded" });

  const moods = ["happy", "energetic", "calm", "focused", "surprised", "stressed"];
  
  // Pick a random mood to simulate detection
  const detectedMood = moods[Math.floor(Math.random() * moods.length)];
  const confidence = (0.75 + Math.random() * 0.20).toFixed(2); // 0.75 - 0.95

  res.json({ mood: detectedMood, confidence: parseFloat(confidence) });
};

// 3. Mood Advice (Context-Aware Responses)
exports.getMoodAdvice = async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const { mood } = req.body;
  const targetMood = mood ? mood.toLowerCase() : "calm";

  // Large database of advice so it feels fresh every time
  const adviceDatabase = {
    happy: [
      "Share your positive energy with a friend.",
      "Tackle your hardest task while motivation is high.",
      "Write down this moment in a gratitude journal.",
      "Take a moment to enjoy this feeling fully.",
      "Use this energy to plan your upcoming week."
    ],
    calm: [
      "This is a great time for deep, focused work.",
      "Read a few pages of a book to stay grounded.",
      "Declutter one small area of your space.",
      "Maintain this peace with a short walk.",
      "Reflect on what went right today."
    ],
    energetic: [
      "Go for a quick run or do 20 jumping jacks.",
      "Knock out those small annoying tasks (email, admin).",
      "Start a new project you've been putting off.",
      "Channel this buzz into creative work.",
      "Clean your workspace vigorously."
    ],
    stressed: [
      "Try the 4-7-8 breathing technique immediately.",
      "Step away from all screens for 5 minutes.",
      "Write down your top 3 worries to get them out of your head.",
      "Drink a large glass of cold water.",
      "Do a quick neck and shoulder stretch."
    ],
    sad: [
      "It is okay to not be okay. Take it slow.",
      "Listen to your favorite comfort music.",
      "Call a close friend or family member.",
      "Step outside for some fresh air and sunlight.",
      "Treat yourself to a warm beverage."
    ],
    focused: [
      "Turn on 'Do Not Disturb' and dive in.",
      "Set a timer for 50 minutes of deep work.",
      "Keep a water bottle nearby to stay hydrated.",
      "Break your big goal into small checkpoints.",
      "Avoid multitasking to maintain this flow."
    ],
    surprised: [
      "Take a moment to process the news/event.",
      "Take three deep breaths before reacting.",
      "Write down your immediate thoughts.",
      "Discuss it with someone you trust.",
      "Pause before making any quick decisions."
    ]
  };

  // Get potential tips for this mood
  const pool = adviceDatabase[targetMood] || adviceDatabase["calm"];
  
  // Return 3 random tips from the pool
  res.json(pickRandom(pool, 3));
};