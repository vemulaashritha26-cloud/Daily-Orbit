/* dashboard.js - Populates the dashboard with live data */

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initTimer(); 
});

async function initDashboard() {
    // 1. Load the Numbers (Total, Active, Completed)
    await loadAnalytics();
    
    // 2. Load the Lists
    await loadRecentTasks();
    await loadRecentMoods();
}

// --- CORE FEATURE: GET TASK COUNTS ---
async function loadAnalytics() {
    try {
        // Fetch math from server
        // Note: Using authFetch to ensure it works with your security
        const res = await authFetch('/api/analytics/summary');
        
        if (!res || !res.ok) {
            console.warn("Analytics endpoint failed or not ready.");
            return;
        }
        
        const data = await res.json();

        // Update the HTML Elements by ID
        // We use '|| 0' to prevent "undefined" from flashing if DB is empty
        const totalEl = document.getElementById('val-total');
        if (totalEl) totalEl.textContent = data.total || 0;

        const completedEl = document.getElementById('val-completed');
        if (completedEl) completedEl.textContent = data.completed || 0;

        const activeEl = document.getElementById('val-active');
        if (activeEl) activeEl.textContent = data.active || 0;

        const rateEl = document.getElementById('val-rate');
        if (rateEl) rateEl.textContent = (data.completionRate || 0) + '%';
        
    } catch (e) { 
        console.error("Analytics Load Failed:", e); 
    }
}

// --- Helper: Load Recent Tasks ---
async function loadRecentTasks() {
    const listEl = document.getElementById('dashboard-task-list');
    if (!listEl) return;

    try {
        const res = await authFetch('/api/tasks');
        if (!res.ok) return;
        
        const tasks = await res.json();
        const recent = tasks.slice(0, 4); // Show top 4

        if (recent.length === 0) {
            listEl.innerHTML = '<div style="padding:15px; color:#888;">No tasks yet.</div>';
            return;
        }

        listEl.innerHTML = recent.map(t => `
            <div class="task-item" style="border-left: 4px solid ${getPriorityColor(t.priority)}; background: rgba(255,255,255,0.5); margin-bottom: 8px; padding: 10px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="material-icons" style="color: ${t.status === 'completed' ? '#43cea2' : '#888'}">
                        ${t.status === 'completed' ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <div>
                        <div style="font-weight:600; color: #333; ${t.status==='completed'?'text-decoration:line-through; opacity:0.6':''}">${t.title}</div>
                        <div style="font-size:0.8rem; color: #666;">${t.category}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// --- Helper: Load Recent Moods ---
async function loadRecentMoods() {
    const listEl = document.getElementById('dashboard-mood-list');
    if (!listEl) return;

    try {
        const res = await authFetch('/api/moods');
        if (!res.ok) return;

        const moods = await res.json();
        const recent = moods.slice(0, 4);

        if (recent.length === 0) {
            listEl.innerHTML = '<div style="padding:15px; color:#888;">No moods logged yet.</div>';
            return;
        }

        listEl.innerHTML = recent.map(m => `
            <div class="mood-item" style="display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid rgba(0,0,0,0.05);">
                <div style="font-size:1.5rem;">${m.emoji || '😐'}</div>
                <div style="flex:1;">
                    <div style="font-weight:600; color:#333;">${m.mood}</div>
                    <div style="font-size:0.8rem; color:#888;">${m.notes || ''}</div>
                </div>
                <div style="font-size:0.75rem; color:#aaa;">
                    ${new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

function getPriorityColor(p) {
    if(p === 'high') return '#ff7a59';
    if(p === 'medium') return '#6b46ff';
    return '#43cea2';
}

// --- Timer Logic ---
function initTimer() {
    const timerDisplay = document.querySelector(".timer-display");
    const playButton = document.querySelector(".play");
    const pauseButton = document.querySelector(".pause");
    const stopButton = document.querySelector(".stop");

    if(!timerDisplay) return;

    let startTime = 0, elapsedTime = 0, isRunning = false, intervalId;

    function formatTime(ms) {
        let sec = Math.floor((ms / 1000) % 60);
        let min = Math.floor((ms / (1000 * 60)) % 60);
        let hr = Math.floor((ms / (1000 * 60 * 60)) % 24);
        return [hr, min, sec].map(v => String(v).padStart(2, "0")).join(":");
    }

    if(playButton) playButton.addEventListener("click", () => {
        if (!isRunning) {
            startTime = Date.now() - elapsedTime;
            intervalId = setInterval(() => {
                elapsedTime = Date.now() - startTime;
                timerDisplay.textContent = formatTime(elapsedTime);
            }, 1000);
            isRunning = true;
            playButton.style.display = "none";
            pauseButton.style.display = "inline-block";
        }
    });

    if(pauseButton) pauseButton.addEventListener("click", () => {
        if (isRunning) {
            clearInterval(intervalId);
            isRunning = false;
            playButton.style.display = "inline-block";
            pauseButton.style.display = "none";
        }
    });

    if(stopButton) stopButton.addEventListener("click", () => {
        clearInterval(intervalId);
        isRunning = false;
        elapsedTime = 0;
        timerDisplay.textContent = "00:00:00";
        playButton.style.display = "inline-block";
        pauseButton.style.display = "none";
    });
}