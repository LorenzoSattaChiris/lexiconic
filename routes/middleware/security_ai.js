/**
 * security_ai.js
 *
 * Middleware to sanitize and moderate user-supplied text for AI requests.
 * It provides:
 *   Rate-limiting by client IP
 *   Input sanitisation using DOMPurify
 *   Basic detection of sensitive API keys 
 *   Handling multiple text fields for flexible AI usage
 *
 * Usage:
 *   Attach this middleware to any route that handles user text input
 *   destined for AI endpoints (e.g., GPT-4).
 */

const axios = require('axios');
const DOMPurify = require('isomorphic-dompurify');

/**
 * =============================
 * 1) Rate Limiting Setup
 * =============================
 */
const requestCount = {};
const RATE_LIMIT = 100;             // Maximum requests per hour per IP
const RATE_RESET_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Middleware function to sanitize and moderate user inputs for AI requests.
 */
module.exports = async (req, res, next) => {
  try {

    const clientIP = req.ip;
    if (!requestCount[clientIP]) {
      requestCount[clientIP] = { count: 0, startTime: Date.now() };
    }

    const timeElapsed = Date.now() - requestCount[clientIP].startTime;

    // Reset the counter if an hour has passed
    if (timeElapsed > RATE_RESET_TIME) {
      requestCount[clientIP] = { count: 0, startTime: Date.now() };
    }

    // Increment request count for this IP
    requestCount[clientIP].count += 1;

    // Enforce the rate limit
    if (requestCount[clientIP].count > RATE_LIMIT) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
      });
    }

    /**
     * =============================
     * 2) Sanitisation & Validation
     * =============================
     *
     * Some routes use "prompt", others use "selectedText" and "entireText".
     * We'll check all relevant fields to ensure safe, valid input.
     */
    const fieldsToSanitize = ['prompt', 'selectedText', 'entireText', 'aiSuggestion'];

    // Helper function to detect and mask API keys
    function maskApiKeys(input) {
      const apiKeyPatterns = [
        /\b[A-Za-z0-9]{32}\b/,             // Generic 32-character API keys
        /\bAIza[0-9A-Za-z_-]{35}\b/,       // Google API keys
        /\b[A-Za-z0-9_-]{39}\b/,           // AWS keys
        /\bsk-proj-[A-Za-z0-9_\-]{20,}\b/, // Example pattern for other possible keys
      ];

      let foundKey = false;
      const replacedText = apiKeyPatterns.reduce((acc, pattern) => {
        if (pattern.test(acc)) {
          foundKey = true;
          console.log('API key detected and masked:', acc.match(pattern));
        }
        return acc.replace(pattern, '[REDACTED]');
      }, input);

      return { replacedText, foundKey };
    }

    // Iterate through each field and sanitize if present
    for (const field of fieldsToSanitize) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        // Clean user input with DOMPurify
        let sanitized = DOMPurify.sanitize(req.body[field]).trim();

        // If the sanitized string is empty, reject as invalid
        if (!sanitized) {
          return res.status(400).json({
            error: `Invalid or malicious content in field "${field}".`,
          });
        }

        // Detect and remove API keys
        const { replacedText, foundKey } = maskApiKeys(sanitized);
        if (foundKey) {
          console.log('Sensitive API key was found and removed in field:', field);
        }

        // Assign the cleaned text back to the request body
        req.body[field] = replacedText;
      }
      // If a field is provided but is not a string, handle as error
      else if (req.body[field] && typeof req.body[field] !== 'string') {
        return res.status(400).json({
          error: `Field "${field}" must be a string.`,
        });
      }
    }

    /**
     * =============================
     * 3) (Optional) Content Moderation
     * =============================
     * A Content Moderation API Could be implemented here if needed. 
     */

    // If all checks pass, proceed to the next middleware
    next();
  } catch (error) {
    console.error('Security middleware error:', error.message);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again later.',
    });
  }
};
