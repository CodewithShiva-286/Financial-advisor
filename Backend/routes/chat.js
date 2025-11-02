/**
 * Chatbot Routes
 * Integrates with Google Gemini API for financial advice
 */

const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * POST /api/chat
 * Send message to Gemini API and get AI response
 * Body: { message }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    // Validation
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message',
      });
    }

    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured',
      });
    }

    // Prepare prompt with financial advisor context
    const prompt = `You are a helpful financial advisor. Answer the user's financial questions in a clear, concise, and professional manner. Provide practical advice based on sound financial principles.

User question: ${message}`;

    // Call Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract response text
    const aiResponse =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response. Please try again.';

    res.json({
      success: true,
      message: aiResponse.trim(),
    });
  } catch (error) {
    console.error('Chat API error:', error.response?.data || error.message);
    
    // Handle specific Gemini API errors
    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request to AI service. Please check your message.',
      });
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API authentication failed. Please check your API key.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error communicating with AI service',
      error: error.message,
    });
  }
});

module.exports = router;

