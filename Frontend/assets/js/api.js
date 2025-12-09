/* api.js - Secure Fetch Helper */
window.authFetch = async function(url, options = {}) {
  const token = localStorage.getItem('user_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
  }
  return response;
};