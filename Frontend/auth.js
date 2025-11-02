/**
 * Authentication JavaScript
 * Handles login and signup functionality
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Check if we're on login or signup page
const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
const isSignupPage = window.location.pathname.includes('signup.html');

/**
 * Save token to localStorage
 */
function saveToken(token) {
  localStorage.setItem('token', token);
}

/**
 * Get token from localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Remove token from localStorage
 */
function removeToken() {
  localStorage.removeItem('token');
}

/**
 * Show error message
 */
function showError(elementId, message) {
  const errorDiv = document.getElementById(elementId);
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorDiv.classList.remove('show');
    }, 5000);
  }
}

/**
 * Handle Login
 */
if (isLoginPage) {
  const loginForm = document.getElementById('loginForm');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        saveToken(data.token);
        window.location.href = 'dashboard.html';
      } else {
        showError('loginError', data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('loginError', 'Network error. Please check if the server is running.');
    }
  });
}

/**
 * Handle Signup
 */
if (isSignupPage) {
  const signupForm = document.getElementById('signupForm');
  
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Validate password length
    if (password.length < 6) {
      showError('signupError', 'Password must be at least 6 characters long.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        saveToken(data.token);
        window.location.href = 'dashboard.html';
      } else {
        showError('signupError', data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showError('signupError', 'Network error. Please check if the server is running.');
    }
  });
}

/**
 * Check if user is already logged in and redirect
 */
const token = getToken();
if (token && (isLoginPage || isSignupPage)) {
  // Verify token is valid
  fetch(`${API_BASE_URL}/auth/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = 'dashboard.html';
      }
    })
    .catch(() => {
      // Token is invalid, clear it
      removeToken();
    });
}

