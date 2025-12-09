/* authGuard.js - Protects pages from unauthorized access */
(function() {
  const token = localStorage.getItem('user_token');
  
  // If no token found, bounce them to login
  if (!token) {
    window.location.href = 'index.html';
  }

  // Optional: You could verify if token is expired here
})();