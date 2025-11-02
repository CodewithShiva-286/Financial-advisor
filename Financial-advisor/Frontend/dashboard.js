/**
 * Dashboard JavaScript
 * Handles all dashboard functionality: SIP Calculator, Chatbot, News
 */

// Auto-detect API base URL (works for both local and production)
const API_BASE_URL = window.location.origin + '/api';

/**
 * Get token from localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Remove token and redirect to login
 */
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

/**
 * Check authentication and load user data
 */
async function checkAuth() {
  const token = getToken();
  
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update user name in sidebar
      const userNameEl = document.getElementById('userName');
      if (userNameEl) {
        userNameEl.textContent = `Welcome, ${data.user.name}!`;
      }
    } else {
      logout();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    logout();
  }
}

/**
 * Navigation between sections
 */
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.content-section');
  
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSection = button.getAttribute('data-section');
      
      // Update active nav button
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Show target section
      sections.forEach(section => section.classList.remove('active'));
      document.getElementById(`${targetSection}Section`).classList.add('active');
      
      // Load data if needed
      if (targetSection === 'news') {
        loadNews();
      } else if (targetSection === 'stocks') {
        loadStockSummary();
      }
    });
  });
}

/**
 * SIP Calculator
 */
function initSIPCalculator() {
  const sipForm = document.getElementById('sipForm');
  
  sipForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const years = parseFloat(document.getElementById('years').value);
    
    try {
      const response = await fetch(`${API_BASE_URL}/sip/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ monthlyInvestment, rate, years }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        displaySIPResults(data.data);
      } else {
        alert(data.message || 'Error calculating SIP');
      }
    } catch (error) {
      console.error('SIP calculation error:', error);
      alert('Network error. Please check if the server is running.');
    }
  });
}

/**
 * Display SIP Results
 */
function displaySIPResults(results) {
  const resultsDiv = document.getElementById('sipResults');
  
  resultsDiv.innerHTML = `
    <div class="result-item">
      <span class="result-label">Monthly Investment:</span>
      <span class="result-value">₹${results.monthlyInvestment.toLocaleString('en-IN')}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Annual Rate:</span>
      <span class="result-value">${results.annualRate}%</span>
    </div>
    <div class="result-item">
      <span class="result-label">Investment Duration:</span>
      <span class="result-value">${results.years} years</span>
    </div>
    <div class="result-item">
      <span class="result-label">Total Invested:</span>
      <span class="result-value">₹${results.totalInvested.toLocaleString('en-IN')}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Estimated Returns:</span>
      <span class="result-value">₹${results.estimatedReturns.toLocaleString('en-IN')}</span>
    </div>
    <div class="result-item highlight">
      <span class="result-label">Final Amount:</span>
      <span class="result-value">₹${results.finalAmount.toLocaleString('en-IN')}</span>
    </div>
  `;
  
  resultsDiv.classList.add('show');
}

/**
 * Chatbot Functionality
 */
function initChatbot() {
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendChatBtn');
  const chatMessages = document.getElementById('chatMessages');
  
  function sendMessage() {
    const message = chatInput.value.trim();
    
    if (!message) {
      return;
    }
    
    // Display user message
    addChatMessage('user', message);
    chatInput.value = '';
    
    // Disable input while waiting for response
    chatInput.disabled = true;
    sendBtn.disabled = true;
    
    // Show typing indicator
    const typingIndicator = addChatMessage('ai', 'Thinking...', true);
    
    // Send to API
    fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ message }),
    })
      .then(res => res.json())
      .then(data => {
        // Remove typing indicator
        typingIndicator.remove();
        
        if (data.success) {
          addChatMessage('ai', data.message);
        } else {
          addChatMessage('ai', data.message || 'Sorry, I encountered an error. Please try again.');
        }
        
        // Re-enable input
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
      })
      .catch(error => {
        console.error('Chat error:', error);
        typingIndicator.remove();
        addChatMessage('ai', 'Network error. Please check your connection and try again.');
        chatInput.disabled = false;
        sendBtn.disabled = false;
      });
  }
  
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

/**
 * Add message to chat with improved formatting
 */
function addChatMessage(type, text, isTemporary = false) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const label = type === 'user' ? 'You' : 'AI Assistant';
  
  // Format the text for better display (preserve line breaks and format markdown-like content)
  const formattedText = formatChatMessage(text);
  
  messageDiv.innerHTML = `
    <div class="message-label">${label}</div>
    <div class="message-text">${formattedText}</div>
  `;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return isTemporary ? messageDiv : null;
}

/**
 * Format chatbot message for better readability
 */
function formatChatMessage(text) {
  if (!text) return '';
  
  // Escape HTML to prevent XSS
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Convert numbered lists (1. item) to HTML lists
  formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
  if (formatted.includes('<li>')) {
    formatted = '<ol>' + formatted + '</ol>';
    formatted = formatted.replace(/<\/ol>\s*<ol>/g, '');
  }
  
  // Convert bullet points (- or •) to HTML lists
  formatted = formatted.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
  if (formatted.includes('<li>') && !formatted.includes('<ol>')) {
    formatted = '<ul>' + formatted + '</ul>';
    formatted = formatted.replace(/<\/ul>\s*<ul>/g, '');
  }
  
  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Convert code blocks
  formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
  formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
  
  return formatted;
}

/**
 * Load News
 */
async function loadNews() {
  const newsContainer = document.getElementById('newsContainer');
  newsContainer.innerHTML = '<div class="loading">Loading news...</div>';
  
  try {
    const response = await fetch(`${API_BASE_URL}/news`);
    const data = await response.json();
    
    if (data.success && data.articles && data.articles.length > 0) {
      displayNews(data.articles);
    } else {
      newsContainer.innerHTML = '<div class="loading">No news available at the moment.</div>';
    }
  } catch (error) {
    console.error('News loading error:', error);
    newsContainer.innerHTML = '<div class="loading">Error loading news. Please try again later.</div>';
  }
}

/**
 * Display News Articles
 */
function displayNews(articles) {
  const newsContainer = document.getElementById('newsContainer');
  
  newsContainer.innerHTML = articles.map(article => `
    <div class="news-card">
      ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" onerror="this.style.display='none'">` : ''}
      <div class="news-meta">
        <span>${article.source || 'Unknown Source'}</span>
        <span>${new Date(article.publishedAt).toLocaleDateString()}</span>
      </div>
      <h3>${article.title}</h3>
      <p>${article.description || 'No description available.'}</p>
      <a href="${article.url}" target="_blank" rel="noopener noreferrer">Read More →</a>
    </div>
  `).join('');
}

/**
 * Stock Market Functionality
 */

/**
 * Load Stock Summary
 */
async function loadStockSummary() {
  const stockSummary = document.getElementById('stockSummary');
  stockSummary.innerHTML = '<div class="loading">Loading stock data...</div>';
  
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/summary`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      displayStockSummary(data.data);
    } else {
      stockSummary.innerHTML = '<div class="loading">Error loading stock data. Please try again.</div>';
    }
  } catch (error) {
    console.error('Stock summary error:', error);
    stockSummary.innerHTML = '<div class="loading">Network error. Please check your connection.</div>';
  }
}

/**
 * Display Stock Summary
 */
function displayStockSummary(stocks) {
  const stockSummary = document.getElementById('stockSummary');
  
  if (!stocks || stocks.length === 0) {
    stockSummary.innerHTML = '<div class="loading">No stock data available.</div>';
    return;
  }

  const tableHTML = `
    <table class="stock-summary-table">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Price (₹)</th>
          <th>Change</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${stocks.map(stock => {
          const changeClass = stock.change && stock.change !== 'N/A' 
            ? (stock.change.startsWith('+') ? 'positive' : stock.change.startsWith('-') ? 'negative' : 'neutral')
            : 'neutral';
          
          return `
            <tr>
              <td><strong>${stock.symbol}</strong></td>
              <td class="stock-price">₹${stock.price}</td>
              <td><span class="stock-change ${changeClass}">${stock.change}</span></td>
              <td>${stock.time}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
  
  stockSummary.innerHTML = tableHTML;
}

/**
 * Load Live Stock Data
 */
async function loadLiveStockData(symbol) {
  const stockLiveData = document.getElementById('stockLiveData');
  stockLiveData.innerHTML = '<div class="loading">Loading live data...</div>';
  stockLiveData.classList.remove('show');
  
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/live?symbol=${encodeURIComponent(symbol)}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayLiveStockData(data);
      stockLiveData.classList.add('show');
    } else {
      stockLiveData.innerHTML = `<div class="loading">${data.message || 'Error loading live data'}</div>`;
    }
  } catch (error) {
    console.error('Live stock data error:', error);
    stockLiveData.innerHTML = '<div class="loading">Network error. Please try again.</div>';
  }
}

/**
 * Display Live Stock Data
 */
function displayLiveStockData(data) {
  const stockLiveData = document.getElementById('stockLiveData');
  
  stockLiveData.innerHTML = `
    <h3 style="margin-bottom: 16px; color: var(--text-primary);">${data.symbol} - Live Data</h3>
    <div class="stock-live-grid">
      <div class="stock-live-item">
        <span class="stock-live-label">Current Price</span>
        <span class="stock-live-value">₹${data.price}</span>
      </div>
      <div class="stock-live-item">
        <span class="stock-live-label">Open</span>
        <span class="stock-live-value">₹${data.open}</span>
      </div>
      <div class="stock-live-item">
        <span class="stock-live-label">High</span>
        <span class="stock-live-value">₹${data.high}</span>
      </div>
      <div class="stock-live-item">
        <span class="stock-live-label">Low</span>
        <span class="stock-live-value">₹${data.low}</span>
      </div>
      <div class="stock-live-item">
        <span class="stock-live-label">Volume</span>
        <span class="stock-live-value">${parseInt(data.volume).toLocaleString()}</span>
      </div>
      <div class="stock-live-item">
        <span class="stock-live-label">Last Updated</span>
        <span class="stock-live-value">${new Date(data.lastUpdated).toLocaleString()}</span>
      </div>
    </div>
  `;
}

/**
 * Load Daily Stock Data
 */
async function loadDailyStockData(symbol) {
  const stockDailyData = document.getElementById('stockDailyData');
  stockDailyData.innerHTML = '<div class="loading">Loading daily data...</div>';
  stockDailyData.classList.remove('show');
  
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/daily?symbol=${encodeURIComponent(symbol)}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      displayDailyStockData(data);
      stockDailyData.classList.add('show');
    } else {
      stockDailyData.innerHTML = `<div class="loading">${data.message || 'Error loading daily data'}</div>`;
    }
  } catch (error) {
    console.error('Daily stock data error:', error);
    stockDailyData.innerHTML = '<div class="loading">Network error. Please try again.</div>';
  }
}

/**
 * Display Daily Stock Data
 */
function displayDailyStockData(data) {
  const stockDailyData = document.getElementById('stockDailyData');
  
  const tableHTML = `
    <h3 style="margin-bottom: 16px; color: var(--text-primary);">${data.symbol} - Daily Data (Last 5 Days)</h3>
    <table class="stock-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Open</th>
          <th>High</th>
          <th>Low</th>
          <th>Close</th>
          <th>Volume</th>
        </tr>
      </thead>
      <tbody>
        ${data.data.map(day => `
          <tr>
            <td>${new Date(day.date).toLocaleDateString()}</td>
            <td>₹${day.open}</td>
            <td>₹${day.high}</td>
            <td>₹${day.low}</td>
            <td><strong>₹${day.close}</strong></td>
            <td>${parseInt(day.volume).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  stockDailyData.innerHTML = tableHTML;
}

/**
 * Load Stock History
 */
async function loadStockHistory(symbol) {
  const stockHistoryData = document.getElementById('stockHistoryData');
  stockHistoryData.innerHTML = '<div class="loading">Loading history...</div>';
  stockHistoryData.classList.remove('show');
  
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/history?symbol=${encodeURIComponent(symbol)}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      displayStockHistory(data);
      stockHistoryData.classList.add('show');
    } else {
      stockHistoryData.innerHTML = `<div class="loading">${data.message || 'Error loading history'}</div>`;
    }
  } catch (error) {
    console.error('Stock history error:', error);
    stockHistoryData.innerHTML = '<div class="loading">Network error. Please try again.</div>';
  }
}

/**
 * Display Stock History
 */
function displayStockHistory(data) {
  const stockHistoryData = document.getElementById('stockHistoryData');
  
  const tableHTML = `
    <h3 style="margin-bottom: 16px; color: var(--text-primary);">${data.symbol} - Recent History (Last 10 Entries)</h3>
    <table class="stock-table">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Open</th>
          <th>High</th>
          <th>Low</th>
          <th>Close</th>
          <th>Volume</th>
        </tr>
      </thead>
      <tbody>
        ${data.data.map(entry => `
          <tr>
            <td>${new Date(entry.timestamp).toLocaleString()}</td>
            <td>₹${entry.open}</td>
            <td>₹${entry.high}</td>
            <td>₹${entry.low}</td>
            <td><strong>₹${entry.close}</strong></td>
            <td>${parseInt(entry.volume).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  stockHistoryData.innerHTML = tableHTML;
}

/**
 * Initialize Stock Market
 */
function initStockMarket() {
  const stockSymbol = document.getElementById('stockSymbol');
  const refreshStocksBtn = document.getElementById('refreshStocksBtn');
  
  // Handle stock symbol selection
  if (stockSymbol) {
    stockSymbol.addEventListener('change', (e) => {
      const symbol = e.target.value;
      if (symbol) {
        loadLiveStockData(symbol);
        loadDailyStockData(symbol);
        loadStockHistory(symbol);
      } else {
        document.getElementById('stockLiveData').classList.remove('show');
        document.getElementById('stockDailyData').classList.remove('show');
        document.getElementById('stockHistoryData').classList.remove('show');
      }
    });
  }
  
  // Handle refresh button
  if (refreshStocksBtn) {
    refreshStocksBtn.addEventListener('click', loadStockSummary);
  }
}

/**
 * Initialize Dashboard
 */
function initDashboard() {
  checkAuth();
  initNavigation();
  initSIPCalculator();
  initChatbot();
  initStockMarket();
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Refresh news button
  const refreshNewsBtn = document.getElementById('refreshNewsBtn');
  if (refreshNewsBtn) {
    refreshNewsBtn.addEventListener('click', loadNews);
  }
  
  // Load data on page load based on active section
  const stocksSection = document.getElementById('stocksSection');
  if (stocksSection && stocksSection.classList.contains('active')) {
    loadStockSummary();
  }
  
  const newsSection = document.getElementById('newsSection');
  if (newsSection && newsSection.classList.contains('active')) {
    loadNews();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

