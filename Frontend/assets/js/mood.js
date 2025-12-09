/* mood.js — Fully AI Integrated (Corrected) */

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
  
  const imageInput = document.getElementById("imageInput");
  const analyzeImageBtn = document.getElementById("analyzeImageBtn");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  const analyzeStatus = document.getElementById("analyzeStatus");

  const trendCtx = document.getElementById("trendChart").getContext("2d");
  let trendChart = null;
  let selectedMood = null;
  let moods = [];

  // --- API Functions ---

  async function loadMoods() {
    try {
      const res = await authFetch('/api/moods');
      if (res && res.ok) {
        moods = await res.json();
        renderHistory();
        updateTrendChart();
      }
    } catch (e) { console.error("Failed to load moods:", e); }
  }

  async function saveMoodToAPI(entry) {
    try {
      const res = await authFetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res && res.ok) await loadMoods();
    } catch (e) { alert("Error saving mood"); }
  }

  async function clearMoodsAPI() {
    if (!confirm("Clear all mood history?")) return;
    try {
      const res = await authFetch('/api/moods', { method: 'DELETE' });
      if (res && res.ok) {
        moods = [];
        renderHistory();
        updateTrendChart();
      }
    } catch (e) { console.error(e); }
  }

  // --- UI Logic ---

  function buildEmojiGrid() {
    MOODS.forEach(m => {
      const b = document.createElement("button");
      b.className = "mood-btn";
      b.dataset.mood = m.id;
      b.title = m.label;
      b.innerHTML = `${m.emoji} <div style="font-size:12px;color:var(--muted-color);margin-top:6px">${m.label}</div>`;
      b.addEventListener("click", () => selectMood(m.id));
      emojiGrid.appendChild(b);
    });
  }

  function selectMood(moodId, source = "manual") {
    const m = MOODS.find(x => x.id === moodId);
    if (!m) return;
    selectedMood = m;

    document.querySelectorAll(".mood-btn").forEach(btn => {
      const isSelected = btn.dataset.mood === moodId;
      btn.classList.toggle('selected', isSelected);
      if(isSelected) {
          btn.style.borderColor = "rgba(107,70,193,0.5)";
          btn.style.transform = "translateY(-2px)";
      } else {
          btn.style.borderColor = "rgba(34,32,52,0.06)";
          btn.style.transform = "none";
      }
    });

    selectedEmojiEl.textContent = m.emoji;
    selectedMoodLabel.textContent = m.label + (source === "image" ? " (Analyzed)" : "");
    selectedMoodTime.textContent = new Date().toLocaleString();
    
    // Call AI Advice
    fetchMoodAdvice(moodId);
  }

  async function fetchMoodAdvice(mood) {
    const listEl = document.getElementById("suggestionsList");
    const container = document.getElementById("suggestionsContainer");
    
    container.style.display = "block";
    listEl.innerHTML = '<li style="color:#888; font-style:italic;">Asking AI for tips...</li>';

    try {
      // Use authFetch to ensure secure connection
      const res = await authFetch('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
      });

      if (!res || !res.ok) throw new Error("API Error");

      const tips = await res.json();
      listEl.innerHTML = "";
      tips.forEach(tip => {
        const li = document.createElement("li");
        li.textContent = tip;
        listEl.appendChild(li);
      });
    } catch (e) {
      console.error(e);
      listEl.innerHTML = '<li>Take a deep breath.</li><li>Drink some water.</li>';
    }
  }

  function handleSaveClick() {
    if (!selectedMood) return alert("Please select a mood first.");
    const notes = moodNotes.value.trim();
    saveMoodToAPI({
      mood: selectedMood.id,
      emoji: selectedMood.emoji,
      notes: notes
    });
    moodNotes.value = "";
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

  async function analyzeImage(file) {
    if (!file) {
      analyzeStatus.textContent = "Choose an image first.";
      return;
    }
    analyzeStatus.textContent = "Analyzing...";
    
    // 🟢 FIX: Correct URL matching server.js
    const BACKEND_URL = "/api/ai/analyze-image"; 

    try {
      // Use standard fetch directly if you haven't wrapped it in authFetch yet
      // or ensure authFetch handles FormData correctly
      const fd = new FormData();
      fd.append("image", file);

      // We use raw fetch here to ensure FormData is handled automatically
      const resp = await fetch(BACKEND_URL, { 
          method: "POST", 
          body: fd 
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json && json.mood) {
          analyzeStatus.textContent = `Detected mood: ${json.mood}`;
          selectMood(json.mood, "image");
          return;
        }
      } else {
        console.warn("Backend analyze failed:", resp.status);
      }
    } catch (e) {
      console.warn("Backend analyze error:", e);
    }

    // Fallback
    const predicted = deterministicMoodFromFile(file);
    analyzeStatus.textContent = `Detected mood (local): ${predicted}`;
    selectMood(predicted, "image");
  }

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
      el.style.cssText = "display:flex; align-items:center; gap:10px; padding:8px 6px; border-bottom:1px solid rgba(0,0,0,0.05);";
      el.innerHTML = `
        <div style="font-size:22px">${m.emoji || moodDef.emoji}</div>
        <div style="flex:1">
          <div style="font-weight:700">${moodDef.label}</div>
          <div style="font-size:0.9rem;color:var(--muted-color)">${m.notes || ""}</div>
        </div>
        <div style="font-size:0.75rem;color:var(--muted-color)">${new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
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
          await authFetch('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({ title: text, category: 'Wellness', priority: 'medium', status: 'active' })
          });
          alert("Added to tasks!");
        } catch(e) { console.error(e); }
      }
    });
    loadMoods();
  }

  init();
})();