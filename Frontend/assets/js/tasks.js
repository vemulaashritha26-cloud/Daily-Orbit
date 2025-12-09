/* tasks.js — Connected to Backend & Filters Events */

(() => {
  // Elements
  const newTaskBtn = document.getElementById("newTaskBtn");
  const taskModal = document.getElementById("taskModal");
  const closeModal = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const taskForm = document.getElementById("taskForm");
  const taskListEl = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");
  const filterCategory = document.getElementById("filterCategory");
  const filterStatus = document.getElementById("filterStatus");
  const globalSearch = document.getElementById("globalSearch");
  const modalTitle = document.getElementById("modalTitle");
  
  // AI Elements
  const aiSuggestBtn = document.getElementById("aiSuggestBtn");
  const aiPanel = document.getElementById("aiSuggestionsPanel");
  const aiList = document.getElementById("aiSuggestionsList");
  const closeAiPanel = document.getElementById("closeAiPanel");

  // State
  let tasks = [];
  let editId = null;
  const HIDDEN_CATEGORIES = ['Birthday', 'Anniversary', 'Meeting'];

  // --- API Functions ---

  async function loadTasks() {
    try {
      const res = await authFetch('/api/tasks');
      if (res && res.ok) {
        tasks = await res.json();
        render();
      }
    } catch (e) { console.error(e); }
  }

  // --- UI Logic ---

  function openModal(editTask) {
    taskModal.style.display = "flex";
    if (editTask) {
      modalTitle.textContent = "Edit Task";
      editId = editTask._id;
      document.getElementById("taskTitle").value = editTask.title;
      document.getElementById("taskCategory").value = editTask.category || "Personal";
      document.getElementById("taskPriority").value = editTask.priority || "medium";
      document.getElementById("taskFrequency").value = editTask.frequency || "once"; 
      
      if (editTask.dueDate) {
          const d = new Date(editTask.dueDate);
          const timeStr = d.toTimeString().slice(0,5);
          document.getElementById("taskDue").value = timeStr;
      }
      document.getElementById("taskNotes").value = editTask.notes || "";
    } else {
      modalTitle.textContent = "New Task";
      editId = null;
      taskForm.reset();
      document.getElementById("taskFrequency").value = "once"; 
    }
  }

  function closeModalFn() {
    taskModal.style.display = "none";
    editId = null;
    taskForm.reset();
  }

  async function saveTask(e) {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value.trim();
    if (!title) return;
    
    const timeVal = document.getElementById("taskDue").value;
    let finalDate = null;
    if (timeVal) {
        const d = new Date();
        const [h, m] = timeVal.split(':');
        d.setHours(h, m, 0, 0);
        finalDate = d;
    }

    const payload = {
      title,
      category: document.getElementById("taskCategory").value,
      priority: document.getElementById("taskPriority").value,
      frequency: document.getElementById("taskFrequency").value,
      dueDate: finalDate,
      notes: document.getElementById("taskNotes").value,
      status: 'active'
    };

    let url = '/api/tasks';
    let method = 'POST';

    if (editId) {
      url = `/api/tasks/${editId}`;
      method = 'PUT';
    }

    try {
      const res = await authFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        closeModalFn();
        loadTasks();
      }
    } catch (e) { console.error(e); }
  }

  async function toggleComplete(task) {
    const newStatus = task.status === 'completed' ? 'active' : 'completed';
    await authFetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    loadTasks();
  }

  async function deleteTask(id) {
    if(confirm("Delete this task?")) {
        await authFetch(`/api/tasks/${id}`, { method: 'DELETE' });
        loadTasks();
    }
  }

  // --- Rendering ---

  function render() {
    const cat = filterCategory.value;
    const status = filterStatus.value;
    const q = globalSearch.value.trim().toLowerCase();
    const sortBy = document.getElementById('sortBy').value;

    let filtered = tasks.filter(t => {
      if (HIDDEN_CATEGORIES.includes(t.category)) return false;
      if (cat !== "all" && t.category !== cat) return false;
      if (status === "active" && t.status === 'completed') return false;
      if (status === "completed" && t.status !== 'completed') return false;
      if (q && !t.title.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sortBy === 'priority') {
        const rank = { high: 1, medium: 2, low: 3 };
        filtered.sort((a,b) => (rank[a.priority]||9) - (rank[b.priority]||9));
    } else {
        filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    taskListEl.innerHTML = "";
    
    // Metrics
    document.getElementById('taskCount').textContent = filtered.length + ' tasks';
    const regularTasks = tasks.filter(t => !HIDDEN_CATEGORIES.includes(t.category));
    document.getElementById('metricTotal').textContent = 'Total: ' + regularTasks.length;
    document.getElementById('metricActive').textContent = 'Active: ' + regularTasks.filter(t=>t.status!=='completed').length;
    document.getElementById('metricCompleted').textContent = 'Completed: ' + regularTasks.filter(t=>t.status==='completed').length;

    if (filtered.length === 0) {
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    filtered.forEach(task => {
      const isDone = task.status === 'completed';
      const item = document.createElement("div");
      item.className = `task-item ${isDone ? 'completed' : ''} priority-${task.priority}`;
      
      const timeStr = task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
      
      let repeatIcon = '';
      if(task.frequency === 'daily') repeatIcon = '<span title="Daily" class="material-icons" style="font-size:14px; margin-left:6px; color:#6b7280;">repeat</span>';
      if(task.frequency === 'weekly') repeatIcon = '<span title="Weekly" class="material-icons" style="font-size:14px; margin-left:6px; color:#6b7280;">event_repeat</span>';

      item.innerHTML = `
        <div class="checkbox" data-action="toggle">${isDone ? "✓" : ""}</div>
        <div class="info">
          <div class="name">
            ${escapeHtml(task.title)} 
            ${repeatIcon}
          </div>
          <div class="meta">
            <span class="chip ${task.category.toLowerCase()}">${task.category}</span> 
            <span style="margin-left:8px;">${timeStr}</span>
          </div>
        </div>
        <div class="task-actions">
          <div class="badge ${task.priority}">${task.priority}</div>
          <button class="icon-button" data-action="edit"><span class="material-icons">edit</span></button>
          <button class="icon-button" data-action="delete"><span class="material-icons">delete</span></button>
        </div>
      `;

      item.querySelector('[data-action="toggle"]').addEventListener('click', () => toggleComplete(task));
      item.querySelector('[data-action="edit"]').addEventListener('click', () => openModal(task));
      item.querySelector('[data-action="delete"]').addEventListener('click', () => deleteTask(task._id));

      taskListEl.appendChild(item);
    });
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // --- AI Suggestions (Fixed Syntax) ---
  if (aiSuggestBtn) {
    aiSuggestBtn.addEventListener('click', async () => {
        aiPanel.style.display = 'block';
        aiList.innerHTML = '<div style="color:var(--muted-color)">Asking AI...</div>';
        try {
            // FIX: Using authFetch correctly here
            const res = await authFetch('/api/ai/suggestions'); 
            const suggestions = await res.json();
            
            aiList.innerHTML = '';
            suggestions.forEach(s => {
                const row = document.createElement('div');
                row.style.cssText = "display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid rgba(255,255,255,0.1);";
                row.innerHTML = `<div><strong>${s.title}</strong><br><small>${s.category} • ${s.priority}</small></div> <button class="add-button" style="padding:4px 8px; font-size:0.8rem;">Add</button>`;
                
                row.querySelector('button').addEventListener('click', async () => {
                    await authFetch('/api/tasks', {
                        method: 'POST',
                        headers: {'Content-Type':'application/json'},
                        body: JSON.stringify({ ...s, status: 'active', frequency: 'once' })
                    });
                    loadTasks();
                });
                aiList.appendChild(row);
            });
        } catch (e) { aiList.innerHTML = 'Error loading suggestions.'; console.error(e); }
    });
  }
  if (closeAiPanel) closeAiPanel.addEventListener('click', () => aiPanel.style.display = 'none');

  // --- Init ---
  newTaskBtn.addEventListener('click', () => openModal());
  closeModal.addEventListener('click', closeModalFn);
  cancelBtn.addEventListener('click', closeModalFn);
  taskForm.addEventListener('submit', saveTask);
  
  filterCategory.addEventListener('change', render);
  filterStatus.addEventListener('change', render);
  globalSearch.addEventListener('input', render);
  document.getElementById('sortBy').addEventListener('change', render);

  loadTasks();
})();