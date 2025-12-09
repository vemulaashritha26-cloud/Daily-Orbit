/* mood.js — Fully AI Integrated */

(() => {
  // Mood definitions
  const MOODS = [
    { id: "happy", emoji: "😊", label: "Happy", color: "#FFD166" },
    { id: "calm", emoji: "😌", label: "Calm", color: "#A8E6CF" },
    { id: "energetic", emoji: "⚡️", label: "Energetic", color: "#FFAA00" },
    { id: "stressed", emoji: "😩", label: "Stressed", color: "#FF8A65" },
    { id: "sad", emoji: "😔", label: "Sad", color: "#90A4AE" },
    { id: "focused", emoji: "🧐", label: "Focused", color: "#C5CAE9" },
    { id: "surprised", emoji: "😲", label: "Surprised", color: "#F8BBD0" }
  ];

  // Static Fallback Rules (Used only if AI fails)
  const SUGGESTIONS = {
    happy: ["Do a focused work sprint.", "Share this moment with a friend.", "Tackle an important task."],
    calm: ["Try a 10-minute meditation.", "Organize your workspace.", "Do a gentle stretch."],
    energetic: ["Start your hardest task.", "Go for a brisk walk.", "Try a Pomodoro timer."],
    stressed: ["Take 3 deep breaths.", "Listen to calming music.", "Break tasks into small steps."],
    sad: ["Do a short relaxation exercise.", "Do one small, easy task.", "Journal about gratitude."],
    focused: ["Turn off notifications.", "Tackle deep work now.", "Use a focus playlist."],
    surprised: ["Take a moment to breathe.", "Write down what happened.", "Re-evaluate your plan."]
  };

  // DOM Elements
  const emojiGrid = document.getElementById("emojiGrid");
  const moodNotes = document.getElementById("moodNotes");
  const saveMoodBtn = document.getElementById("saveMoodBtn");
  const clearMoodsBtn = document.getElementById("clearMoodsBtn");
  const moodHistoryEl = document.getElementById("moodHistory");
  const selectedEmojiEl = document.getElementById("selectedEmoji");
  const selectedMoodLabel = document.getElementById("selectedMoodLabel");
  const selectedMoodTime = document.getElementById("selectedMoodTime");
  const suggestionsContainer = document.getElementById("suggestionsContainer");
  const suggestionsList = document.getElementById("suggestionsList");
  const applySuggestionBtn = document.getElementById("applySuggestionBtn");
  
  // Image Analysis Elements
  const imageInput = document.getElementById("imageInput");
  const analyzeImageBtn = document.getElementById("analyzeImageBtn");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  const analyzeStatus = document.getElementById("analyzeStatus");

  // Chart
  const trendCtx = document.getElementById("trendChart").getContext("2d");
  let trendChart = null;

  let selectedMood = null;
  let moods = [];

  // --- API Functions ---

  async function loadMoods() {
    try {
      const res = await fetch('/api/moods'); // Use authFetch if using protected routes
      if (res.ok) {
        moods = await res.json();
        renderHistory();
        updateTrendChart();
      }
    } catch (e) {
      console.error("Failed to load moods:", e);
    }
  }

  async function saveMoodToAPI(entry) {
    try {
      const res = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        await loadMoods();
      }
    } catch (e) {
      console.error("Failed to save mood:", e);
      alert("Error saving mood");
    }
  }

  async function clearMoodsAPI() {
    if (!confirm("Clear all mood history?")) return;
    try {
      const res = await fetch('/api/moods', { method: 'DELETE' });
      if (res.ok) {
        moods = [];
        renderHistory();
        updateTrendChart();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // --- UI Logic ---

  function buildEmojiGrid() {
    MOODS.forEach(m => {
      const b = document.createElement("button");
      b.className = "mood-btn";
      b.dataset.mood = m.id;
      b.title = m.label;
      b.style.fontSize = "26px";
      b.style.padding = "10px";
      b.style.borderRadius = "10px";
      b.style.border = "1px solid rgba(34,32,52,0.06)";
      b.style.background = "transparent";
      b.style.cursor = "pointer";
      b.innerHTML = `${m.emoji} <div style="font-size:12px;color:var(--muted-color);margin-top:6px">${m.label}</div>`;
      
      b.addEventListener("click", () => selectMood(m.id));
      emojiGrid.appendChild(b);
    });
  }

  function selectMood(moodId, source = "manual") {
    const m = MOODS.find(x => x.id === moodId);
    if (!m) return;
    selectedMood = m;

    // Highlight buttons
    document.querySelectorAll(".mood-btn").forEach(btn => {
      const isSelected = btn.dataset.mood === moodId;
      btn.style.boxShadow = isSelected ? "0 6px 18px rgba(34,32,52,0.08)" : "none";
      btn.style.borderColor = isSelected ? "rgba(107,70,193,0.18)" : "rgba(34,32,52,0.06)";
      btn.style.transform = isSelected ? "translateY(-2px)" : "none";
    });

    selectedEmojiEl.textContent = m.emoji;
    selectedMoodLabel.textContent = m.label + (source === "image" ? " (Analyzed)" : "");
    selectedMoodTime.textContent = new Date().toLocaleString();
    
    // 🟢 KEY FIX: Ask AI for advice!
    fetchMoodAdvice(moodId);
  }

  // Fetch Advice from AI
  async function fetchMoodAdvice(mood) {
    const listEl = document.getElementById("suggestionsList");
    const container = document.getElementById("suggestionsContainer");
    
    container.style.display = "block";
    listEl.innerHTML = '<li style="color:#888; font-style:italic;">Asking AI for tips...</li>';

    try {
      const res = await fetch('/api/ai/mood-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })

      });

      if (!res.ok) throw new Error("API Error");

      const tips = await res.json();
      
      listEl.innerHTML = "";
      tips.forEach(tip => {
        const li = document.createElement("li");
        li.textContent = tip;
        listEl.appendChild(li);
      });

    } catch (e) {
      console.error(e);
      // Fallback if AI fails
      showSuggestionsFor(mood);
    }
  }

  // Static Fallback
  function showSuggestionsFor(moodId) {
    const list = SUGGESTIONS[moodId] || ["Take a short break."];
    suggestionsList.innerHTML = "";
    list.forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      suggestionsList.appendChild(li);
    });
    suggestionsContainer.style.display = "block";
  }

  function handleSaveClick() {
    if (!selectedMood) {
      alert("Please select a mood first.");
      return;
    }
    const notes = moodNotes.value.trim();
    const entry = {
      mood: selectedMood.id,
      emoji: selectedMood.emoji,
      notes: notes
    };
    saveMoodToAPI(entry);
    moodNotes.value = "";
    selectedEmojiEl.animate([{ transform: "scale(1.05)" }, { transform: "scale(1)" }], { duration: 250 });
  }

  // --- Image Analysis (Fixed FormData) ---

  function previewImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
  // assets/js/mood.js
async function requestMoodAdvice(mood) {
  try {
    const res = await fetch('/api/ai/mood-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood })
    });
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch mood advice', err);
    return null;
  }
}


  async function handleImageAnalysis() {
    const file = imageInput.files[0];
    if (!file) {
      alert("Please select an image first.");
      return;
    }

    analyzeStatus.textContent = "Analyzing...";
    
    // Create FormData
    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await fetch('/api/ai/analyze-image', { 
        method: 'POST',
        body: fd 
      });
      
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      
      if (data.mood) {
        analyzeStatus.textContent = `Detected: ${data.mood} (${Math.round(data.confidence * 100)}%)`;
        selectMood(data.mood, "image");
      }
    } catch (error) {
      console.error(error);
      analyzeStatus.textContent = "AI Failed. Using offline simulation...";
      
      // 🟢 FIX: Use Math.random() so it changes every time!
      const randomIndex = Math.floor(Math.random() * MOODS.length);
      const randomMood = MOODS[randomIndex].id;
      
      selectMood(randomMood, "image");
    }
  }

  // --- History & Charts ---

  function renderHistory() {
    moodHistoryEl.innerHTML = "";
    if (!moods.length) {
      moodHistoryEl.innerHTML = `<div style="color:var(--muted-color)">No moods logged yet.</div>`;
      return;
    }
    moods.forEach(m => {
      const moodDef = MOODS.find(x => x.id === m.mood) || { emoji: "❓", label: m.mood };
      const el = document.createElement("div");
      el.className = "mood-item";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.gap = "10px";
      el.style.padding = "8px 6px";
      el.style.borderBottom = "1px solid rgba(34,32,52,0.03)";
      const dateStr = m.timestamp ? new Date(m.timestamp).toLocaleString() : "Just now";
      el.innerHTML = `
        <div style="font-size:22px">${m.emoji || moodDef.emoji}</div>
        <div style="flex:1">
          <div style="font-weight:700">${moodDef.label}</div>
          <div style="font-size:0.9rem;color:var(--muted-color)">${m.notes || ""}</div>
        </div>
        <div style="font-size:0.85rem;color:var(--muted-color)">${dateStr}</div>
      `;
      moodHistoryEl.appendChild(el);
    });
  }

  function updateTrendChart() {
    const lastSeven = moods.slice(0, 7).reverse();
    const labels = lastSeven.map(m => new Date(m.timestamp).toLocaleDateString(undefined, {weekday:'short'}));
    const mapping = MOODS.reduce((acc, x, i) => { acc[x.id] = i + 1; return acc; }, {});
    const data = lastSeven.map(m => mapping[m.mood] || 1);

    if (!trendChart) {
      trendChart = new Chart(trendCtx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Mood Level",
            data,
            tension: 0.4,
            borderColor: '#6b46ff',
            backgroundColor: 'rgba(107, 70, 255, 0.1)',
            borderWidth: 2,
            pointRadius: 4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { display: false, min: 0, max: 8 }, x: { grid: { display: false } } }
        }
      });
    } else {
      trendChart.data.labels = labels;
      trendChart.data.datasets[0].data = data;
      trendChart.update();
    }
  }

  // --- Init ---

  function init() {
    buildEmojiGrid();
    
    saveMoodBtn.addEventListener("click", handleSaveClick);
    clearMoodsBtn.addEventListener("click", clearMoodsAPI);
    
    imageInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) previewImage(e.target.files[0]);
    });
    
    analyzeImageBtn.addEventListener("click", handleImageAnalysis);

    applySuggestionBtn.addEventListener("click", async () => {
      const text = suggestionsList.querySelector("li")?.textContent;
      if (text) {
        try {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              title: text,
              category: 'Wellness',
              priority: 'medium',
              status: 'active'
            })
          });
          alert("Suggestion added to your Tasks!");
        } catch(e) { console.error(e); }
      }
    });

    loadMoods();
  }

  init();
})();