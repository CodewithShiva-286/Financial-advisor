/**
 * SIP Calculator Routes
 * Handles SIP (Systematic Investment Plan) calculations
 */

const express = require('express');
const router = express.Router();

/**
 * POST /api/sip/calculate
 * Calculate SIP returns
 * Body: { monthlyInvestment, rate, years }
 */
router.post('/calculate', (req, res) => {
  try {
    const { monthlyInvestment, rate, years } = req.body;

    // Validation
    if (!monthlyInvestment || !rate || !years) {
      return res.status(400).json({
        success: false,
        message: 'Please provide monthlyInvestment, rate, and years',
      });
    }

    // Convert to numbers
    const P = parseFloat(monthlyInvestment);
    const r = parseFloat(rate) / 100 / 12; // Monthly interest rate
    const n = parseFloat(years) * 12; // Total number of months

    // Validate inputs
    if (P <= 0 || r < 0 || n <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input values. All values must be positive.',
      });
    }

    // SIP Formula: M = P × [{(1 + r)^n - 1} / r] × (1 + r)
    // Where:
    // M = Maturity amount
    // P = Monthly investment
    // r = Monthly interest rate
    // n = Number of months

    let maturityAmount;
    if (r === 0) {
      // If rate is 0, simple calculation
      maturityAmount = P * n;
    } else {
      // Calculate (1 + r)^n
      const compoundFactor = Math.pow(1 + r, n);
      
      // Calculate maturity amount
      maturityAmount = P * ((compoundFactor - 1) / r) * (1 + r);
    }

    // Calculate total invested
    const totalInvested = P * n;

    // Calculate estimated returns
    const estimatedReturns = maturityAmount - totalInvested;

    res.json({
      success: true,
      data: {
        monthlyInvestment: P,
        annualRate: parseFloat(rate),
        years: parseFloat(years),
        totalInvested: Math.round(totalInvested * 100) / 100,
        estimatedReturns: Math.round(estimatedReturns * 100) / 100,
        finalAmount: Math.round(maturityAmount * 100) / 100,
      },
    });
  } catch (error) {
    console.error('SIP calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating SIP',
      error: error.message,
    });
  }
});

module.exports = router;

