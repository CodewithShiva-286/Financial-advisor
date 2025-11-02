# Backend Setup

## Environment Variables

Create a `.env` file in this directory with the following variables:

```env
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
NEWS_API_KEY=your_newsapi_key_here
ALPHA_VANTAGE_KEY=your_alphavantage_key_here
PORT=5000
```

## Installation

```bash
npm install
```

## Run Server

```bash
node server.js
```

Or with auto-reload (if nodemon is installed):

```bash
npm run dev
```

The server will start on port 5000 by default.

