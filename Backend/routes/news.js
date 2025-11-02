/**
 * News Routes
 * Fetches financial news from NewsAPI.org
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

/**
 * GET /api/news
 * Fetch financial and business news
 */
router.get('/', async (req, res) => {
  try {
    // Check if API key is configured
    if (!NEWS_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'NewsAPI key is not configured',
      });
    }

    // Fetch news from NewsAPI
    // Using financial/business category and popular sources
    const response = await axios.get(NEWS_API_URL, {
      params: {
        category: 'business',
        country: 'us',
        pageSize: 10, // Get 10 articles
        apiKey: NEWS_API_KEY,
      },
    });

    // Format response
    const articles = response.data.articles.map((article) => ({
      title: article.title,
      description: article.description || 'No description available',
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source.name,
    }));

    res.json({
      success: true,
      articles,
      totalResults: response.data.totalResults,
    });
  } catch (error) {
    console.error('News API error:', error.response?.data || error.message);

    // Handle specific NewsAPI errors
    if (error.response?.status === 401) {
      return res.status(500).json({
        success: false,
        message: 'NewsAPI authentication failed. Please check your API key.',
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'NewsAPI rate limit exceeded. Please try again later.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching news',
      error: error.message,
    });
  }
});

module.exports = router;

