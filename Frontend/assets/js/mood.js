/* mood.js — Debug Version */

(() => {
  console.log("🚀 Mood Script Loaded"); // Check console for this!

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
  
  // Image Elements
  const imageInput = document.getElementById("imageInput");
  const analyzeImageBtn = document.getElementById("analyzeImageBtn");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  const analyzeStatus = document.getElementById("analyzeStatus");

  // Chart
  const trendCtx = document.getElementById("trendChart")?.getContext("2d");

  // Verify Elements exist
  if (!analyzeImageBtn) console.error("❌ Error: Button 'analyzeImageBtn' not found in HTML");
  if (!imageInput) console.error("❌ Error: Input 'imageInput' not found in HTML");

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

  let selectedMood = null;
  let moods = [];

  // --- 1. Load Data ---
  async function loadMoods() {
    try {
      const res = await authFetch('/api/moods');
      if (res && res.ok) {
        moods = await res.json();
        renderHistory();
        if(trendCtx) updateTrendChart();
      }
    } catch (e) { console.error(e); }
  }

  // --- 2. Image Analysis (The Part you are fixing) ---
  async function handleImageAnalysis() {
    console.log("🖱️ Analyze Button Clicked");

    const file = imageInput.files[0];
    if (!file) {
      alert("Please select an image first.");
      return;
    }

    if(analyzeStatus) analyzeStatus.textContent = "Analyzing... (Please wait)";
    
    // 1. Prepare Data
    const fd = new FormData();
    fd.append('image', file);

    try {
      const token = localStorage.getItem('user_token');
      
      // 2. Send Request
      console.log("📡 Sending request to /api/ai/analyze-image...");
      
      // Use standard fetch to let browser handle multipart headers
      const res = await fetch('/api/ai/analyze-image', { 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: fd 
      });
      
      console.log("U+1F4E1 Response Status:", res.status);

      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      const data = await res.json();
      console.log("📦 Data received:", data);
      
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

  // --- 3. UI Helpers ---
  function buildEmojiGrid() {
    if(!emojiGrid) return;
    MOODS.forEach(m => {
      const b = document.createElement("button");
      b.className = "mood-btn";
      b.dataset.mood = m.id;
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
    
    // Fetch Advice
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
    if (!selectedMood) return alert("Select a mood first.");
    const notes = moodNotes.value.trim();
    saveMoodToAPI({ mood: selectedMood.id, emoji: selectedMood.emoji, notes });
    moodNotes.value = "";
  }

  async function saveMoodToAPI(entry) {
      await authFetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      loadMoods();
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
    moodHistoryEl.innerHTML = moods.map(m => `
        <div class="mood-item" style="display:flex; gap:10px; padding:8px; border-bottom:1px solid #eee;">
            <div style="font-size:20px;">${m.emoji}</div>
            <div>
                <strong>${m.mood}</strong>
                <div style="font-size:0.8rem; color:#888;">${new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
        </div>
    `).join('');
  }

  function updateTrendChart() {
      // Basic Chart Logic
      if(!trendChart && trendCtx && Chart) {
          trendChart = new Chart(trendCtx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Mood', data: [] }] }
          });
      }
  }

  // --- INIT ---
  buildEmojiGrid();
  loadMoods();

  if(saveMoodBtn) saveMoodBtn.addEventListener("click", handleSaveClick);
  
  if(imageInput) imageInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) previewImage(e.target.files[0]);
  });
  
  if(analyzeImageBtn) {
      console.log("✅ Button Listener Attached");
      analyzeImageBtn.addEventListener("click", handleImageAnalysis);
  } else {
      console.error("❌ Button Listener FAILED");
  }

})();