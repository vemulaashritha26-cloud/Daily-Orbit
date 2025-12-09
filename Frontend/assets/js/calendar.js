/* calendar.js — Rings + Moods (No Flowers) */

(() => {
  // Configuration
  const EVENT_COLORS = {
    'Work': '#6366f1',
    'Meeting': '#3b82f6',
    'Personal': '#10b981',
    'Wellness': '#06b6d4',
    'Errands': '#9ca3af',
    'Birthday': '#ec4899',
    'Anniversary': '#f59e0b'
  };

  const RECURRING_TYPES = ['Birthday', 'Anniversary'];

  // DOM Elements
  const weekHeader = document.getElementById("weekHeader");
  const daysGrid = document.getElementById("daysGrid");
  const currentMonthLabel = document.getElementById("currentMonthLabel");
  const prevMonth = document.getElementById("prevMonth");
  const nextMonth = document.getElementById("nextMonth");
  const goToday = document.getElementById("goToday");
  const addEventFloating = document.getElementById("addEventFloating");
  const addTaskToDate = document.getElementById("addTaskToDate");
  const upcomingReminders = document.getElementById("upcomingReminders");
  const selectedDayLabel = document.getElementById("selectedDayLabel");
  const dayTasks = document.getElementById("dayTasks");

  // Modal
  const eventModal = document.getElementById("eventModal");
  const closeEventModal = document.getElementById("closeEventModal");
  const eventForm = document.getElementById("eventForm");
  const eventModalTitle = document.getElementById("eventModalTitle");
  const eventTitle = document.getElementById("eventTitle");
  const eventDate = document.getElementById("eventDate");
  const eventTime = document.getElementById("eventTime");
  const eventCategory = document.getElementById("eventCategory");
  const eventPriority = document.getElementById("eventPriority");
  const eventNotes = document.getElementById("eventNotes");
  const saveBtn = eventForm ? eventForm.querySelector('button[type="submit"]') : null;
  const deleteEventBtn = document.getElementById("deleteEventBtn");
  const cancelEventBtn = document.getElementById("cancelEventBtn");

  // State
  let viewDate = new Date(); 
  const today = new Date();
  let selectedDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  let tasks = [];
  let moods = [];
  let editingEventId = null;

  // --- Helper: Date Matching ---
  function isEventOnDay(item, dateStr) {
    const itemDate = new Date(item.dueDate || item.createdAt);
    const [tYear, tMonth, tDay] = dateStr.split('-').map(Number);
    const iYear = itemDate.getFullYear();
    const iMonth = itemDate.getMonth() + 1;
    const iDay = itemDate.getDate();

    if (RECURRING_TYPES.includes(item.category)) {
        return iMonth === tMonth && iDay === tDay;
    } else {
        return iYear === tYear && iMonth === tMonth && iDay === tDay;
    }
  }

  async function loadData() {
    try {
      const [resTasks, resMoods] = await Promise.all([
        authFetch('/api/tasks'),
        authFetch('/api/moods')
      ]);
      
      if(resTasks && resTasks.ok) tasks = await resTasks.json();
      if(resMoods && resMoods.ok) moods = await resMoods.json();

      renderCalendar();
      selectDay(selectedDate);
      renderUpcomingList();
    } catch (e) { console.error(e); }
  }

  // --- Render Calendar (RINGS + MOOD) ---
  function renderWeekHeader(){
    if(!weekHeader) return;
    weekHeader.innerHTML = '';
    const wk = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    wk.forEach(d => {
      const el = document.createElement('div');
      el.style.cssText = "text-align:center; font-weight:700; color:#9ca3af; font-size:0.85rem; padding-bottom:12px; text-transform:uppercase;";
      el.textContent = d;
      weekHeader.appendChild(el);
    });
  }

  function renderCalendar(){
    if(!daysGrid) return;
    daysGrid.innerHTML = '';
    currentMonthLabel.textContent = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Padding
    for(let i=0; i < firstDayIndex; i++) daysGrid.appendChild(document.createElement('div'));

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

    for(let d=1; d <= lastDate; d++){
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const el = document.createElement('div');
      el.className = 'calendar-day';
      
      if(dateStr === todayStr) el.classList.add('today');
      if(dateStr === selectedDate) el.classList.add('selected');

      const dayItems = tasks.filter(t => isEventOnDay(t, dateStr));

      // --- COLOR LOGIC (Rings) ---
      let ringColor = 'transparent';
      
      if (dayItems.length > 0) {
          const events = dayItems.filter(t => RECURRING_TYPES.includes(t.category));
          const daily = dayItems.filter(t => !RECURRING_TYPES.includes(t.category));

          if (events.length > 0) {
              if (events.some(t => t.category === 'Birthday')) ringColor = EVENT_COLORS['Birthday'];
              else ringColor = EVENT_COLORS['Anniversary'];
          } else if (daily.length > 0) {
              if (daily.some(t => t.priority === 'high')) ringColor = '#ef4444';
              else {
                  const cat = daily[0].category;
                  ringColor = EVENT_COLORS[cat] || '#9ca3af';
              }
          }
      }

      // --- MOOD LOGIC (Emoji) ---
      const mood = moods.find(m => m.timestamp.startsWith(dateStr));
      const moodHTML = mood ? `<div class="day-mood" title="${mood.label}">${mood.emoji}</div>` : '';

      el.innerHTML = `
        ${moodHTML}
        <div class="day-num" style="border-color:${ringColor};">${d}</div>
      `;

      el.addEventListener('click', () => {
        document.querySelectorAll('.calendar-day').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        selectDay(dateStr);
      });
      daysGrid.appendChild(el);
    }
  }

  // --- Sidebar Logic ---
  function selectDay(dateStr) {
    selectedDate = dateStr;
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m-1, d);
    if(selectedDayLabel) selectedDayLabel.textContent = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    
    const dayItems = tasks.filter(t => isEventOnDay(t, dateStr));
    if(!dayTasks) return;
    dayTasks.innerHTML = '';

    const events = dayItems.filter(t => RECURRING_TYPES.includes(t.category));
    const dailyTasks = dayItems.filter(t => !RECURRING_TYPES.includes(t.category));

    // Events
    if (events.length > 0) {
        const h = document.createElement('h4');
        h.textContent = "🎉 Special Events";
        h.style.cssText = "margin:0 0 10px 0;font-size:0.8rem;color:#ec4899;text-transform:uppercase;";
        dayTasks.appendChild(h);
        events.forEach(t => renderSidebarItem(t, true));
    }

    // Tasks
    const h = document.createElement('h4');
    h.textContent = "📝 Daily Tasks";
    h.style.cssText = "margin:15px 0 10px 0;font-size:0.8rem;color:#6366f1;text-transform:uppercase;";
    dayTasks.appendChild(h);

    if (dailyTasks.length === 0) {
        dayTasks.innerHTML += '<div style="color:#9ca3af;text-align:center;padding:15px;font-style:italic;">No tasks.</div>';
    } else {
        dailyTasks.forEach(t => renderSidebarItem(t, false));
    }
  }

  function renderSidebarItem(t, isEvent) {
      const color = EVENT_COLORS[t.category] || '#9ca3af';
      const bg = isEvent ? '#fff0f7' : 'white';
      const timeStr = t.dueDate && t.dueDate.includes('T') ? new Date(t.dueDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';

      const item = document.createElement('div');
      item.style.cssText = `padding:10px; background:${bg}; border-left:4px solid ${color}; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,0.05);`;
      item.innerHTML = `
          <div>
              <div style="font-weight:700; color:#374151;">${t.title}</div>
              <div style="font-size:0.75rem; color:#6b7280;">${t.category} ${timeStr ? '• '+timeStr : ''}</div>
          </div>
          <button class="icon-button delete-btn" style="color:#ef4444;"><span class="material-icons" style="font-size:18px;">delete</span></button>
      `;
      
      item.querySelector('.delete-btn').addEventListener('click', async (e) => {
           e.stopPropagation();
           if(confirm('Delete?')) { await authFetch(`/api/tasks/${t._id}`, { method: 'DELETE' }); loadData(); }
      });
      item.addEventListener('click', () => openModal(t));
      dayTasks.appendChild(item);
  }

  // --- Upcoming ---
  function renderUpcomingList() {
      if(!upcomingReminders) return;
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

      const upcoming = tasks
        .filter(t => !RECURRING_TYPES.includes(t.category) && new Date(t.dueDate) >= tomorrow && t.status !== 'completed')
        .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 4);

      let html = `<h4 style="margin:24px 0 10px 0; font-size:0.8rem; font-weight:700; color:#9ca3af; text-transform:uppercase;">Upcoming</h4>`;
      if(upcoming.length === 0) html += '<div style="color:#9ca3af; font-size:0.85rem;">No upcoming tasks.</div>';
      else {
          html += upcoming.map(t => `
            <div style="margin-bottom:8px; display:flex; align-items:center; gap:8px;">
                <div style="width:8px; height:8px; border-radius:50%; background:${EVENT_COLORS[t.category]||'#ccc'}"></div>
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:0.9rem;">${t.title}</div>
                    <div style="color:#9ca3af; font-size:0.75rem;">${new Date(t.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
                </div>
            </div>`).join('');
      }
      upcomingReminders.innerHTML = html;
  }

  // --- Modal Logic ---
  function openModal(taskToEdit = null) {
      if(!eventModal) return;
      eventModal.style.display = 'flex';
      eventForm.reset();
      eventDate.value = selectedDate; 
      const now = new Date(); now.setMinutes(0); now.setHours(now.getHours() + 1);
      eventTime.value = now.toTimeString().slice(0,5);

      if(taskToEdit && taskToEdit._id) {
          editingEventId = taskToEdit._id;
          eventModalTitle.textContent = "Edit Item";
          eventTitle.value = taskToEdit.title;
          eventCategory.value = taskToEdit.category;
          eventPriority.value = taskToEdit.priority;
          eventNotes.value = taskToEdit.notes || "";
          
          if(taskToEdit.dueDate) {
              const dt = new Date(taskToEdit.dueDate);
              eventDate.value = dt.toISOString().split('T')[0];
              eventTime.value = dt.toTimeString().slice(0,5);
          }
          if(deleteEventBtn) deleteEventBtn.style.display = 'inline-block';
          if(saveBtn) saveBtn.textContent = 'Update';
      } else {
          editingEventId = null;
          eventModalTitle.textContent = "New Item";
          if(deleteEventBtn) deleteEventBtn.style.display = 'none';
          if(saveBtn) saveBtn.textContent = 'Save';
      }
  }

  function closeModal() { if(eventModal) eventModal.style.display = 'none'; }

  async function saveEvent(e) {
      e.preventDefault();
      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;
      try {
          const finalDate = new Date(`${eventDate.value}T${eventTime.value}`);
          const payload = {
              title: eventTitle.value,
              category: eventCategory.value,
              priority: eventPriority.value,
              notes: eventNotes ? eventNotes.value : "",
              dueDate: finalDate,
              status: 'active'
          };
          let url = '/api/tasks'; let method = 'POST';
          if (editingEventId) { url = `/api/tasks/${editingEventId}`; method = 'PUT'; }
          const res = await authFetch(url, { method: method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
          if(res && res.ok) { closeModal(); await loadData(); } else { alert("Failed to save."); }
      } catch (err) { console.error(err); } finally { saveBtn.disabled = false; saveBtn.textContent = "Save"; }
  }

  renderWeekHeader();
  loadData();

  if(prevMonth) prevMonth.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth()-1); renderCalendar(); });
  if(nextMonth) nextMonth.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth()+1); renderCalendar(); });
  if(goToday) goToday.addEventListener('click', () => { 
      const n = new Date();
      viewDate = new Date(); 
      selectedDate = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
      renderCalendar(); 
      selectDay(selectedDate); 
  });
  
  if(addTaskToDate) addTaskToDate.addEventListener('click', () => openModal());
  if(addEventFloating) addEventFloating.addEventListener('click', () => openModal());
  if(closeEventModal) closeEventModal.addEventListener('click', closeModal);
  if(cancelEventBtn) cancelEventBtn.addEventListener('click', closeModal);
  if(eventForm) eventForm.addEventListener('submit', saveEvent);
  if(deleteEventBtn) deleteEventBtn.addEventListener('click', async () => { if(editingEventId && confirm("Delete?")) { await authFetch(`/api/tasks/${editingEventId}`, { method: 'DELETE' }); closeModal(); loadData(); }});
})();