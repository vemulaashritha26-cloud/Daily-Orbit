/* api.js - Connected to Live Render Backend */

// 🟢 YOUR LIVE BACKEND URL
const API_BASE_URL = "https://dailyorbit-backend-umlt.onrender.com";

window.authFetch = async function(endpoint, options = {}) {
  const token = localStorage.getItem('user_token');
  
  // Create Headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Attach Token if logged in
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // 🔗 COMBINE BASE URL + ENDPOINT (e.g. https://.../api/tasks)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Handle Expired Token
    if (response.status === 401) {
      console.warn("Session expired. Logging out...");
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      window.location.href = 'index.html';
      return null;
    }

    return response;

  } catch (error) {
    console.error("API Request Failed:", error);
    alert("Could not connect to the server. It might be waking up (Render takes 30s).");
    throw error;
  }
};