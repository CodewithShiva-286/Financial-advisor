# Financial Advisor Web App (MVP)

A complete full-stack financial advisor application built with Node.js, Express, MongoDB Atlas, and vanilla JavaScript frontend.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT tokens
- **SIP Calculator**: Calculate Systematic Investment Plan returns
- **Live Stock Market Feed**: Real-time prices for top Indian stocks (RELIANCE, TCS, INFY, HDFC, SBI)
- **Stock History & Daily Data**: View intraday and daily time series data with interactive tables
- **AI Financial Chatbot**: Get financial advice using Google Gemini API with improved formatting
- **Market News**: Latest financial and business news from NewsAPI.org
- **Modern UI**: Clean, responsive design that works on all devices

## 📁 Project Structure

```
cep sam/
├── Backend/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sip.js
│   │   ├── chat.js
│   │   └── news.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env (create this file)
├── Frontend/
│   ├── index.html (Login page)
│   ├── signup.html
│   ├── dashboard.html
│   ├── styles.css
│   ├── auth.js
│   └── dashboard.js
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (free tier works)
- Google Gemini API key
- NewsAPI.org API key

### Step 1: Install Backend Dependencies

```bash
cd Backend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `Backend` directory with the following content:

```env
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
NEWS_API_KEY=your_newsapi_key_here
ALPHA_VANTAGE_KEY=your_alphavantage_key_here
PORT=5000
```

**Important**: Replace all placeholder values with your actual API keys:
- **MONGO_URI**: Get from MongoDB Atlas → Connect → Connection string
- **JWT_SECRET**: Any strong random string (e.g., use a password generator)
- **GEMINI_API_KEY**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **NEWS_API_KEY**: Get from [NewsAPI.org](https://newsapi.org/register)
- **ALPHA_VANTAGE_KEY**: Get from [Alpha Vantage](https://www.alphavantage.co/support/#api-key) (Free tier: 5 requests/min, 500 requests/day)

### Step 3: Start the Backend Server

```bash
cd Backend
node server.js
```

You should see:
```
✅ Connected to MongoDB Atlas successfully
🚀 Server running on port 5000
📍 Health check: http://localhost:5000/index.html
```

### Step 4: Open the Frontend

Simply open `Frontend/index.html` in your web browser. You can:

1. Double-click the file to open it in your default browser
2. Or use a local server (recommended):
   ```bash
   # Using Python
   cd Frontend
   python -m http.server 8000
   # Then visit http://localhost:8000
   
   # Or using Node.js http-server
   npx http-server Frontend -p 8000
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get user profile (protected)

### SIP Calculator
- `POST /api/sip/calculate` - Calculate SIP returns
  ```json
  {
    "monthlyInvestment": 5000,
    "rate": 12,
    "years": 5
  }
  ```

### Chatbot
- `POST /api/chat` - Send message to AI chatbot (protected)
  ```json
  {
    "message": "Should I start an SIP for 5 years?"
  }
  ```

### Stocks (Alpha Vantage)
- `GET /api/stocks/summary` - Fetch live prices for top 5 Indian stocks (protected)
- `GET /api/stocks/live?symbol=<SYMBOL>` - Get intraday live data for a single symbol (protected)
- `GET /api/stocks/daily?symbol=<SYMBOL>` - Get daily time series (last 5 trading days) (protected)
- `GET /api/stocks/history?symbol=<SYMBOL>&month=<YYYY-MM>` - Get historical intraday data (protected)

### News
- `GET /api/news` - Fetch latest financial news

## 🎯 Usage

1. **Sign Up**: Create a new account with your name, email, and password
2. **Login**: Use your credentials to access the dashboard
3. **SIP Calculator**: Enter monthly investment, expected return rate, and duration to calculate returns
4. **Stock Market**: 
   - View live stock prices for top Indian stocks
   - Select a stock symbol to see live data, daily trends, and historical intraday data
   - Refresh button updates the latest prices
5. **AI Chatbot**: Ask any financial question and get AI-powered advice with formatted responses
6. **Market News**: Browse the latest financial and business news
7. **Logout**: Securely logout from your account

**Note**: Alpha Vantage free tier has rate limits (5 requests/minute). The stock summary endpoint automatically spaces requests to stay within limits.

## 🔒 Security Features

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected routes require valid tokens
- CORS enabled for frontend communication

## 🌐 Deployment Notes

When deploying to production (e.g., Render):

1. Update `API_BASE_URL` in `Frontend/auth.js` and `Frontend/dashboard.js` to your production backend URL
2. Ensure your MongoDB Atlas IP whitelist allows your deployment server
3. Set environment variables in your hosting platform
4. Use HTTPS for secure token transmission

## 📝 Notes

- The frontend uses `fetch()` API to communicate with the backend
- JWT tokens are stored in localStorage
- All API calls include proper error handling
- The UI is fully responsive and mobile-friendly

## 🐛 Troubleshooting

**Cannot connect to MongoDB Atlas:**
- Check your connection string in `.env`
- Verify your IP is whitelisted in MongoDB Atlas
- Ensure your cluster is running

**API errors:**
- Verify all API keys are correct in `.env`
- Check if API quotas are not exceeded
- Ensure backend server is running

**Frontend not loading:**
- Check browser console for errors
- Verify backend is running on port 5000
- Try using a local server instead of opening HTML directly

## 📄 License

This project is open source and available for personal use.

---

**Happy Coding! 🎉**


