/* mood.js — Live Production Fixed */

(() => {
  // 🟢 SMART SERVER URL DETECTION
  // If we are on localhost, use local server. Otherwise, use Render.
  const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const API_BASE = IS_LOCAL 
      ? "http://localhost:3000" 
      : "https://dailyorbit-backend-umlt.onrender.com";

  // Data
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

  const trendCtx = document.getElementById("trendChart")?.getContext("2d");
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
        if(trendCtx) updateTrendChart();
      }
    } catch (e) { console.error("Failed to load moods:", e); }
  }

  // --- Image Analysis (THE FIX IS HERE) ---
  async function handleImageAnalysis() {
    const file = imageInput.files[0];
    if (!file) {
      alert("Please select an image first.");
      return;
    }

    if(analyzeStatus) analyzeStatus.textContent = "Analyzing... (Connecting to Cloud)";
    
    const fd = new FormData();
    fd.append('image', file);

    try {
      const token = localStorage.getItem('user_token');
      
      // 🟢 USE THE FULL URL WE DEFINED AT THE TOP
      const res = await fetch(`${API_BASE}/api/ai/analyze-image`, { 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: fd 
      });
      
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      const data = await res.json();
      
      if (data.mood) {
        if(analyzeStatus) analyzeStatus.textContent = `Detected: ${data.mood} (${Math.round(data.confidence * 100)}%)`;
        selectMood(data.mood, "image");
      }
    } catch (error) {
      console.error("❌ Analysis Failed:", error);
      if(analyzeStatus) analyzeStatus.textContent = "AI Failed. Using simulation...";
      
      // Fallback
      const randomIndex = Math.floor(Math.random() * MOODS.length);
      selectMood(MOODS[randomIndex].id, "image");
    }
  }

  // --- UI Logic ---

  function buildEmojiGrid() {
    if(!emojiGrid) return;
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
      btn.style.boxShadow = isSelected ? "0 6px 18px rgba(34,32,52,0.08)" : "none";
      btn.style.transform = isSelected ? "translateY(-2px)" : "none";
    });

    if(selectedEmojiEl) selectedEmojiEl.textContent = m.emoji;
    if(selectedMoodLabel) selectedMoodLabel.textContent = m.label + (source === "image" ? " (Analyzed)" : "");
    if(selectedMoodTime) selectedMoodTime.textContent = new Date().toLocaleString();
    
    fetchMoodAdvice(moodId);
  }

  async function fetchMoodAdvice(mood) {
    if(!suggestionsContainer) return;
    suggestionsContainer.style.display = "block";
    suggestionsList.innerHTML = '<li style="color:#888;">Asking AI...</li>';

    try {
      const res = await authFetch('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
      });
      const tips = await res.json();
      suggestionsList.innerHTML = "";
      tips.forEach(tip => {
        const li = document.createElement("li");
        li.textContent = tip;
        suggestionsList.appendChild(li);
      });
    } catch (e) {
      suggestionsList.innerHTML = '<li>Take a break.</li>';
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

  async function saveMoodToAPI(entry) {
    try {
      await authFetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      loadMoods();
    } catch (e) { alert("Error saving mood"); }
  }

  async function clearMoodsAPI() {
    if (!confirm("Clear all mood history?")) return;
    try {
      await authFetch('/api/moods', { method: 'DELETE' });
      loadMoods();
    } catch (e) { console.error(e); }
  }

  function previewImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
      if(previewImg) previewImg.src = e.target.result;
      if(imagePreview) imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  function renderHistory() {
    if(!moodHistoryEl) return;
    if (!moods.length) {
      moodHistoryEl.innerHTML = `<div style="color:var(--muted-color)">No moods logged yet.</div>`;
      return;
    }
    moodHistoryEl.innerHTML = moods.map(m => `
        <div class="mood-item" style="display:flex; align-items:center; gap:10px; padding:8px 6px; border-bottom:1px solid rgba(0,0,0,0.05);">
            <div style="font-size:22px">${m.emoji}</div>
            <div style="flex:1">
                <div style="font-weight:700">${m.mood}</div>
                <div style="font-size:0.9rem;color:var(--muted-color)">${m.notes || ""}</div>
            </div>
            <div style="font-size:0.75rem;color:var(--muted-color)">${new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
        </div>
    `).join('');
  }

  function updateTrendChart() {
    const lastSeven = moods.slice(0, 7).reverse();
    const labels = lastSeven.map(m => new Date(m.timestamp).toLocaleDateString(undefined, {weekday:'short'}));
    const mapping = MOODS.reduce((acc, x, i) => { acc[x.id] = i + 1; return acc; }, {});
    const data = lastSeven.map(m => mapping[m.mood] || 1);

    if (!trendChart && trendCtx && Chart) {
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
    } else if (trendChart) {
      trendChart.data.labels = labels;
      trendChart.data.datasets[0].data = data;
      trendChart.update();
    }
  }

  function init() {
    buildEmojiGrid();
    if(saveMoodBtn) saveMoodBtn.addEventListener("click", handleSaveClick);
    if(clearMoodsBtn) clearMoodsBtn.addEventListener("click", clearMoodsAPI);
    
    if(imageInput) imageInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) previewImage(e.target.files[0]);
    });
    
    if(analyzeImageBtn) analyzeImageBtn.addEventListener("click", handleImageAnalysis);

    if(applySuggestionBtn) applySuggestionBtn.addEventListener("click", async () => {
      const text = suggestionsList.querySelector("li")?.textContent;
      if (text) {
        try {
          await authFetch('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({ title: text, category: 'Wellness', priority: 'medium', status: 'active' })
          });
          alert("Suggestion added to your Tasks!");
        } catch(e) { console.error(e); }
      }
    });

    loadMoods();
  }

  init();
})();