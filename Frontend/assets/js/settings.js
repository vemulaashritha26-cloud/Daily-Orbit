/* settings.js - Handle profile updates */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profileForm');
  const nameInput = document.getElementById('settingName');
  const emailInput = document.getElementById('settingEmail');
  const passInput = document.getElementById('settingPassword');
  
  // Load current data
  nameInput.value = localStorage.getItem('user_name') || '';
  emailInput.value = localStorage.getItem('user_email') || '';

  // 1. Update Profile
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: nameInput.value,
      email: emailInput.value
    };
    if (passInput.value) payload.password = passInput.value;

    try {
      const res = await authFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        // Update LocalStorage
        localStorage.setItem('user_name', data.name);
        localStorage.setItem('user_email', data.email);
        alert('Profile updated successfully!');
        location.reload(); // Refresh to see changes in header
      } else {
        alert('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
    }
  });

  // 2. Export Data
  document.getElementById('exportDataBtn').addEventListener('click', async () => {
    try {
      const [tasks, moods] = await Promise.all([
        authFetch('/api/tasks').then(r => r.json()),
        authFetch('/api/moods').then(r => r.json())
      ]);
      
      const exportObj = { date: new Date(), tasks, moods };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "dailyorbit_data.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert("Failed to export data.");
    }
  });

  // 3. Delete Account
  document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
    const confirmation = prompt("To confirm deletion, type 'DELETE' below:");
    if (confirmation === 'DELETE') {
      try {
        const res = await authFetch('/api/auth/profile', { method: 'DELETE' });
        if (res.ok) {
          alert('Account deleted.');
          localStorage.clear();
          window.location.href = 'index.html';
        }
      } catch (e) {
        alert("Error deleting account.");
      }
    }
  });
});