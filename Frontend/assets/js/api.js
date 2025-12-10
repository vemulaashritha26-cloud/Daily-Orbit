/* api.js — Smart Auto-Detection */

// 🟢 AUTOMATICALLY DETECT SERVER
// If browser says "localhost" or "127.0.0.1", use Local server. Otherwise, use Render.
const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const API_BASE_URL = IS_LOCAL 
    ? "http://localhost:3000" 
    : "https://dailyorbit-backend-umlt.onrender.com";

console.log(`🔌 API connecting to: ${API_BASE_URL}`);

window.authFetch = async function(endpoint, options = {}) {
  const token = localStorage.getItem('user_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Attach Token if logged in
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // 🔗 COMBINE BASE URL + ENDPOINT
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
    // Only alert if we are clearly failing to connect
    if (IS_LOCAL) {
        alert("Could not connect to Local Server. Is 'node server.js' running?");
    }
    throw error;
  }
};