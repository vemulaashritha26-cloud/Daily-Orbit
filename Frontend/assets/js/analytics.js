/* analytics.js — Connected to Backend API */

(() => {
  // Configuration
  const MOODS = [
    { id: "happy", label: "Happy", color: "#FFD166" },
    { id: "calm", label: "Calm", color: "#A8E6CF" },
    { id: "energetic", label: "Energetic", color: "#FFAA00" },
    { id: "stressed", label: "Stressed", color: "#FF8A65" },
    { id: "sad", label: "Sad", color: "#90A4AE" },
    { id: "focused", label: "Focused", color: "#C5CAE9" },
    { id: "surprised", label: "Surprised", color: "#F8BBD0" }
  ];

  // Map mood IDs to a score (1-7) for the trend line
  const moodIndexMap = MOODS.reduce((acc, m, i) => { acc[m.id] = i + 1; return acc; }, {});

  // DOM Elements
  const statCompleted = document.getElementById("statCompleted");
  const statAvgMood = document.getElementById("statAvgMood");
  const statConsistency = document.getElementById("statConsistency");
  const moodRange = document.getElementById("moodRange");
  const taskRange = document.getElementById("taskRange");
  const insightsList = document.getElementById("insightsList");

  // Chart Contexts
  const moodTrendCtx = document.getElementById("moodTrendChart").getContext("2d");
  const tasksCatCtx = document.getElementById("tasksCategoryChart").getContext("2d");
  const moodDistCtx = document.getElementById("moodDistChart").getContext("2d");

  let moodTrendChart = null;
  let tasksCatChart = null;
  let moodDistChart = null;

  // Global Data State
  let allTasks = [];
  let allMoods = [];

  // --- API Fetching ---

  async function init() {
    try {
      // Fetch data in parallel
      const [resTasks, resMoods] = await Promise.all([
        authFetch('/api/tasks'), // Use secure fetch
        authFetch('/api/moods')
      ]);

      if (resTasks && resTasks.ok) allTasks = await resTasks.json();
      if (resMoods && resMoods.ok) allMoods = await resMoods.json();

      refreshAll();
    } catch (e) {
      console.error("Analytics Load Error:", e);
    }
  }

  // --- Data Helpers ---

  function getMoodData(days = 30) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return allMoods.filter(m => new Date(m.timestamp).getTime() >= cutoff);
  }

  function getTaskData(days = 30) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return allTasks.filter(t => new Date(t.createdAt).getTime() >= cutoff);
  }

  // --- Metrics Calculation ---

  function totalCompletedTasks(days = 30) {
    const tasks = getTaskData(days);
    return tasks.filter(t => t.status === 'completed').length;
  }

  function avgMoodIndex(days = 30) {
    const moods = getMoodData(days);
    if (!moods.length) return 0;
    const vals = moods.map(m => moodIndexMap[m.mood] || 4);
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }

  function consistencyScore(days = 30) {
    const moods = getMoodData(days);
    if (!days) return 0;
    const uniqueDays = new Set(moods.map(m => new Date(m.timestamp).toDateString()));
    return Math.round((uniqueDays.size / days) * 100);
  }

  // --- Charts Rendering ---

  function renderMoodTrend(days = 30) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const buckets = {};
    
    // Create empty buckets
    for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - ((days - 1 - i) * 86400000));
        buckets[d.toISOString().split('T')[0]] = [];
    }

    allMoods.forEach(m => {
        const d = new Date(m.timestamp);
        if (d.getTime() >= cutoff) {
            const key = d.toISOString().split('T')[0];
            if (buckets[key]) buckets[key].push(moodIndexMap[m.mood] || 4);
        }
    });

    const labels = Object.keys(buckets).map(dateStr => dateStr.slice(5)); // MM-DD
    const data = Object.values(buckets).map(arr => {
        if (!arr.length) return null;
        return (arr.reduce((a,b) => a+b, 0) / arr.length).toFixed(1);
    });

    if (moodTrendChart) moodTrendChart.destroy();
    moodTrendChart = new Chart(moodTrendCtx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Avg Mood",
          data,
          borderColor: '#6b46ff',
          backgroundColor: 'rgba(107, 70, 255, 0.1)',
          tension: 0.4,
          pointRadius: 3,
          fill: true
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 1, max: 8, display: false }, x: { grid: { display: false } } }
      }
    });
  }

  function renderTasksCategory(days = 30) {
    const tasks = getTaskData(days);
    const counts = {};
    tasks.forEach(t => {
      const cat = t.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const colors = labels.map((_, i) => `hsl(${(i * 60) % 360}, 70%, 60%)`);

    if (tasksCatChart) tasksCatChart.destroy();
    tasksCatChart = new Chart(tasksCatCtx, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Tasks", data, backgroundColor: colors, borderRadius: 6 }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: {display: false} }, x: { grid: {display: false} } }
      }
    });
  }

  function renderMoodDistribution(days = 90) {
    const moods = getMoodData(days);
    const counts = {};
    moods.forEach(m => { counts[m.mood] = (counts[m.mood] || 0) + 1; });

    const labels = Object.keys(counts).map(id => {
        const m = MOODS.find(x => x.id === id);
        return m ? m.label : id;
    });
    const data = Object.values(counts);
    const colors = Object.keys(counts).map(id => {
        const m = MOODS.find(x => x.id === id);
        return m ? m.color : "#ddd";
    });

    if (moodDistChart) moodDistChart.destroy();
    moodDistChart = new Chart(moodDistCtx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0 }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: "right", labels: { boxWidth: 12 } } }
      }
    });
  }

  function renderInsights() {
    const moods30 = getMoodData(30);
    const tasks30 = getTaskData(30);
    const insights = [];

    if (!moods30.length) {
      insights.push("Start logging your daily moods to see patterns here.");
    } else {
      const freq = {};
      moods30.forEach(m => freq[m.mood] = (freq[m.mood]||0) + 1);
      const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]);
      if (sorted.length) {
        const mostMood = MOODS.find(m => m.id === sorted[0][0]);
        insights.push(`Your dominant mood lately is <strong>${mostMood ? mostMood.label : sorted[0][0]}</strong>.`);
      }
    }

    const completedCount = tasks30.filter(t => t.status === 'completed').length;
    if (completedCount > 0) {
      insights.push(`You have completed <strong>${completedCount} tasks</strong> in the last 30 days.`);
    } else {
      insights.push("Complete some tasks to see productivity insights.");
    }

    insightsList.innerHTML = insights.map(s => `<li style="margin-bottom:8px;">${s}</li>`).join("");
  }

  function refreshAll() {
    // Update Stats
    statCompleted.textContent = totalCompletedTasks(30);
    statAvgMood.textContent = avgMoodIndex(30);
    statConsistency.textContent = consistencyScore(30) + "%";

    // Update Charts
    renderMoodTrend(parseInt(moodRange.value) || 30);
    renderTasksCategory(parseInt(taskRange.value) || 30);
    renderMoodDistribution(90);
    renderInsights();
  }

  // Event Listeners
  moodRange.addEventListener("change", () => renderMoodTrend(parseInt(moodRange.value)));
  taskRange.addEventListener("change", () => renderTasksCategory(parseInt(taskRange.value)));

  // Start
  init();
})();