/* navigation.js — highlights active link, handles logout, and updates profile info */
(function(){
  // 1. Highlight active link
  const path = window.location.pathname.split("/").pop() || "dashboard.html";
  const navLinks = document.querySelectorAll('.sidebar nav a');
  
  navLinks.forEach(a => {
    const href = a.getAttribute('href').split('?')[0];
    if (href === path) a.classList.add('active');
    else a.classList.remove('active');
  });

  // 2. Handle Logout
  const logoutLinks = document.querySelectorAll('a[href="index.html"]');
  logoutLinks.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear(); // Clears token, name, and email
      window.location.href = 'index.html';
    });
  });

  // 3. Update User Profile in Header (NEW)
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const avatarEl = document.getElementById('header-avatar');

  const storedName = localStorage.getItem('user_name') || 'Guest';
  const storedEmail = localStorage.getItem('user_email') || '';

  // Update Text
  if (nameEl) nameEl.textContent = storedName;
  if (emailEl) emailEl.textContent = storedEmail;

  // Update Avatar (Initials)
  if (avatarEl && storedName !== 'Guest') {
    avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(storedName)}&background=6b46ff&color=fff`;
  }
})();