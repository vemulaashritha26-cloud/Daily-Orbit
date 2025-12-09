// Backend/aiEngines/mockAI.js
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

const mockSuggestions = [
  { title: "Review project milestones", category: "Work", priority: "high" },
  { title: "Organize your study notes", category: "Study", priority: "medium" },
  { title: "Go for a 20-min walk", category: "Health", priority: "low" },
  { title: "Clean your desk area", category: "Personal", priority: "medium" }
];

const FALLBACK_ADVICE = {
  happy: ["Share energy with a friend!", "Tackle a difficult task while you feel good.", "Write one gratitude."],
  calm: ["Try a 10-minute meditation.", "Organize your workspace.", "Read a short article."],
  energetic: ["Do a short exercise sprint.", "Start a high-priority task.", "Use the energy for a focused sprint."],
  stressed: ["Breath 4-7-8 for 3 rounds.", "Take a brief walk.", "Break tasks into 3 small steps."],
  sad: ["Call a friend.", "Write one positive note.", "Listen to a comforting song."],
  focused: ["Keep going for 25 minutes (Pomodoro).", "Avoid switching tasks.", "Batch similar work."],
  surprised: ["Pause and breathe.", "Note your immediate thoughts.", "Take 3 deep breaths before acting."]
};

module.exports = {
  async getSuggestions() {
    return Array.from({length:4}, () => random(mockSuggestions));
  },

  async analyzeImage(filePart) {
    return {
      expression: random(["happy","calm","energetic","stressed","sad","focused","surprised"]),
      confidence: 0.8,
      details: "Mock analysis: offline mode"
    };
  },

  async getMoodAdvice(mood, extra = {}) {
    const key = (mood || "calm").toLowerCase();
    return FALLBACK_ADVICE[key] || FALLBACK_ADVICE["calm"];
  },

  async classifyTask(text) {
    return {
      title: text,
      category: random(["Work","Study","Personal","Health"]),
      priority: random(["low","medium","high"])
    };
  },

  async getSummary(tasks = []) {
    return {
      summary: `You have ${tasks.length} tasks. Focus on "${tasks[0]?.title || "a top task"}".`
    };
  },

  async getTips() {
    return [
      "Use Pomodoro (25/5).",
      "Focus on one task at a time.",
      "Plan tomorrow before sleep.",
      "Take regular short breaks."
    ];
  }
};
