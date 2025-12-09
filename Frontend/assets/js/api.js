/* api.js - Local Development Mode */

// 🟢 ACTIVE: Point to Render (Cloud)
const API_BASE_URL = "https://dailyorbit-backend-umlt.onrender.com";

// 🔴 INACTIVE: Local Development
// const API_BASE_URL = "http://localhost:3000";

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
    alert("Could not connect to the server. Ensure 'node server.js' is running.");
    throw error;
  }
};