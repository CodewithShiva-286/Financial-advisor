/**
 * Stock Market Routes
 * Integrates with Alpha Vantage API for live stock data
 */

const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Top Indian stocks to track
const TOP_STOCKS = [
  'RELIANCE.BSE',
  'TCS.BSE',
  'INFY.BSE',
  'HDFCBANK.BSE',
  'SBIN.BSE',
];

/**
 * Helper function to delay execution (for rate limiting)
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper function to fetch Alpha Vantage data
 */
async function fetchAlphaVantageData(params) {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        ...params,
        apikey: ALPHA_VANTAGE_KEY,
      },
    });

    // Check for API errors
    if (response.data['Error Message']) {
      throw new Error(response.data['Error Message']);
    }

    if (response.data['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    return response.data;
  } catch (error) {
    console.error('Alpha Vantage API error:', error.message);
    throw error;
  }
}

/**
 * Helper function to calculate price change percentage
 */
function calculateChange(currentPrice, previousPrice) {
  if (!previousPrice || previousPrice === 0) return '0.00%';
  const change = ((currentPrice - previousPrice) / previousPrice) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Helper function to format time
 */
function formatTime(timeString) {
  if (!timeString) return 'N/A';
  // Format: "2025-11-02 15:30:00" -> "15:30"
  const match = timeString.match(/(\d{2}:\d{2})/);
  return match ? match[1] : timeString;
}

/**
 * GET /api/stocks/summary
 * Fetch live prices for top Indian stocks
 */
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    if (!ALPHA_VANTAGE_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Alpha Vantage API key is not configured',
      });
    }

    // Fetch all stocks with delays to avoid rate limits (free tier: 5 requests/min)
    // Note: Free tier allows 5 requests per minute, so we space them out
    const stockPromises = TOP_STOCKS.map(async (symbol, index) => {
      // Add delay between requests (12 seconds between each = 5 requests per minute)
      if (index > 0) {
        await delay(index * 12000); // 12 seconds between requests
      }

      try {
        const data = await fetchAlphaVantageData({
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: '5min',
          outputsize: 'compact',
        });

        const timeSeries = data['Time Series (5min)'];
        if (!timeSeries) {
          return {
            symbol,
            price: 'N/A',
            change: 'N/A',
            time: 'N/A',
            error: 'No data available',
          };
        }

        // Get latest and previous prices
        const timeKeys = Object.keys(timeSeries).sort().reverse();
        const latestKey = timeKeys[0];
        const previousKey = timeKeys[1] || timeKeys[0];

        const latest = timeSeries[latestKey];
        const previous = timeSeries[previousKey];

        const currentPrice = parseFloat(latest['4. close']);
        const previousPrice = parseFloat(previous['4. close']);

        return {
          symbol,
          price: currentPrice.toFixed(2),
          change: calculateChange(currentPrice, previousPrice),
          time: formatTime(latestKey),
        };
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
        return {
          symbol,
          price: 'N/A',
          change: 'N/A',
          time: 'N/A',
          error: error.message,
        };
      }
    });

    const results = await Promise.all(stockPromises);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Stock summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock summary',
      error: error.message,
    });
  }
});

/**
 * GET /api/stocks/live?symbol=<symbol>
 * Fetch intraday live data for a single symbol
 */
router.get('/live', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a symbol parameter',
      });
    }

    if (!ALPHA_VANTAGE_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Alpha Vantage API key is not configured',
      });
    }

    const data = await fetchAlphaVantageData({
      function: 'TIME_SERIES_INTRADAY',
      symbol: symbol,
      interval: '5min',
      outputsize: 'compact',
    });

    const timeSeries = data['Time Series (5min)'];
    if (!timeSeries) {
      return res.status(404).json({
        success: false,
        message: 'No data available for this symbol',
      });
    }

    // Get latest data point
    const timeKeys = Object.keys(timeSeries).sort().reverse();
    const latestKey = timeKeys[0];
    const latest = timeSeries[latestKey];

    res.json({
      success: true,
      symbol,
      price: parseFloat(latest['4. close']).toFixed(2),
      open: parseFloat(latest['1. open']).toFixed(2),
      high: parseFloat(latest['2. high']).toFixed(2),
      low: parseFloat(latest['3. low']).toFixed(2),
      volume: latest['5. volume'],
      lastUpdated: latestKey,
    });
  } catch (error) {
    console.error('Live stock data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live stock data',
      error: error.message,
    });
  }
});

/**
 * GET /api/stocks/daily?symbol=<symbol>
 * Fetch daily time series data for last 5 trading days
 */
router.get('/daily', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a symbol parameter',
      });
    }

    if (!ALPHA_VANTAGE_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Alpha Vantage API key is not configured',
      });
    }

    const data = await fetchAlphaVantageData({
      function: 'TIME_SERIES_DAILY',
      symbol: symbol,
      outputsize: 'compact',
    });

    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      return res.status(404).json({
        success: false,
        message: 'No data available for this symbol',
      });
    }

    // Get last 5 trading days
    const dailyData = Object.keys(timeSeries)
      .sort()
      .reverse()
      .slice(0, 5)
      .map((date) => {
        const dayData = timeSeries[date];
        return {
          date,
          open: parseFloat(dayData['1. open']).toFixed(2),
          close: parseFloat(dayData['4. close']).toFixed(2),
          high: parseFloat(dayData['2. high']).toFixed(2),
          low: parseFloat(dayData['3. low']).toFixed(2),
          volume: dayData['5. volume'],
        };
      });

    res.json({
      success: true,
      symbol,
      data: dailyData,
    });
  } catch (error) {
    console.error('Daily stock data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily stock data',
      error: error.message,
    });
  }
});

/**
 * GET /api/stocks/history?symbol=<symbol>&month=<YYYY-MM>
 * Fetch historical intraday data for a specific month
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { symbol, month } = req.query;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a symbol parameter',
      });
    }

    if (!ALPHA_VANTAGE_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Alpha Vantage API key is not configured',
      });
    }

    const params = {
      function: 'TIME_SERIES_INTRADAY',
      symbol: symbol,
      interval: '5min',
      outputsize: 'full',
    };

    // Add month parameter if provided
    if (month) {
      params.month = month;
    }

    const data = await fetchAlphaVantageData(params);

    const timeSeries = data['Time Series (5min)'];
    if (!timeSeries) {
      return res.status(404).json({
        success: false,
        message: 'No data available for this symbol',
      });
    }

    // Get recent 10 entries for display
    const historyData = Object.keys(timeSeries)
      .sort()
      .reverse()
      .slice(0, 10)
      .map((timestamp) => {
        const entry = timeSeries[timestamp];
        return {
          timestamp,
          open: parseFloat(entry['1. open']).toFixed(2),
          high: parseFloat(entry['2. high']).toFixed(2),
          low: parseFloat(entry['3. low']).toFixed(2),
          close: parseFloat(entry['4. close']).toFixed(2),
          volume: entry['5. volume'],
        };
      });

    res.json({
      success: true,
      symbol,
      data: historyData,
    });
  } catch (error) {
    console.error('Stock history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock history',
      error: error.message,
    });
  }
});

module.exports = router;
