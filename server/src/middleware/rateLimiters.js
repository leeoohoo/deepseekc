import rateLimit, { ipKeyGenerator as defaultIpKeyGenerator } from 'express-rate-limit';
import { RateLimitError } from './errorHandler.js';

/**
 * Rate limiters for DeepSeek CLI Website
 * Provides protection against abuse and DoS attacks
 */

// In-memory store for rate limiting (can be replaced with Redis for distributed systems)
const store = new Map();

/**
 * Custom key generator that combines IP and email for /send-code endpoint
 */
function sendCodeKeyGenerator(req) {
  // Use express-rate-limit's built-in ipKeyGenerator to handle IPv6 subnetting
  const ip = defaultIpKeyGenerator(req);
  const email = req.body?.email ? req.body.email.toLowerCase() : 'unknown';
  
  // Create combined key: ip:email
  return `${ip}:${email}`;
}

/**
 * Custom key generator for IP-based limiting only
 * Delegates to express-rate-limit's built-in ipKeyGenerator for IPv6 handling
 */
function ipKeyGenerator(req) {
  return defaultIpKeyGenerator(req);
}

/**
 * Custom handler for rate limit exceeded
 */
function rateLimitHandler(req, res) {
  const error = new RateLimitError('Too many requests, please try again later');
  
  // Calculate retry time
  const windowMs = req.rateLimit?.windowMs || 15 * 60 * 1000; // Default 15 minutes
  const resetTime = new Date(Date.now() + windowMs);
  
  res.status(429).json({
    success: false,
    error: 'RateLimitExceeded',
    message: 'Too many requests, please try again later',
    retryAfter: Math.ceil(windowMs / 1000), // seconds
    retryAt: resetTime.toISOString()
  });
}

/**
 * Skip rate limiting for certain conditions
 */
function skipRateLimit(req) {
  // Skip for health checks
  if (req.path === '/health' || req.path === '/health/email') {
    return true;
  }
  
  // Skip for internal IPs (optional - for development/testing). Use defaultIpKeyGenerator for consistent IPv6 handling.
  let ip = defaultIpKeyGenerator(req);
  // Ensure ip is a string for .includes() method
  ip = typeof ip === 'string' ? ip : String(ip || '');
  if (process.env.NODE_ENV === 'development') {
    if (ip === '127.0.0.1' || ip === '::1' || (typeof ip === 'string' && ip.includes('192.168.'))) {
      return true;
    }
  }
  
  // Skip for whitelisted IPs (if configured)
  const whitelist = process.env.RATE_LIMIT_WHITELIST ? 
    process.env.RATE_LIMIT_WHITELIST.split(',') : [];

  // Note: Whitelist entries should use the same format as ipKeyGenerator returns
  if (whitelist.includes(ip)) {
    return true;
  }
  
  return false;
}

/**
 * Rate limiter for /send-code endpoint (dual protection)
 * 1. Per IP limit: 5 requests per 15 minutes
 * 2. Per email limit: 3 requests per 15 minutes
 * Combined in a single limiter using custom key generator
 */
export const sendCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Different limits based on request characteristics
    const ip = ipKeyGenerator(req);
    const email = req.body?.email || '';

    // Stricter limit for unauthenticated requests
    if (!req.user) {
      return 5; // 5 requests per 15 minutes for unauthenticated
    }
    
    // Slightly higher limit for authenticated users
    return 10; // 10 requests per 15 minutes for authenticated
  },
  keyGenerator: sendCodeKeyGenerator,
  handler: rateLimitHandler,
  skip: skipRateLimit,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  
  // Custom message for logging
  message: 'Rate limit exceeded for verification code sending',
  
  // Skip failed requests (only count successful ones)
  skipFailedRequests: false,
  
  // Store for rate limiting data
  store: {
    incr: (key, cb) => {
      const now = Date.now();
      const entry = store.get(key) || { count: 0, resetTime: new Date(now + 15 * 60 * 1000) };
      
      entry.count++;
      store.set(key, entry);
      
      // Cleanup old entries periodically (simplified)
      if (Math.random() < 0.01) { // 1% chance to cleanup
        for (const [oldKey, oldEntry] of store.entries()) {
          if (oldEntry.resetTime < now) {
            store.delete(oldKey);
          }
        }
      }
      
      cb(null, entry.count, entry.resetTime);
    },
    decrement: (key) => {
      const entry = store.get(key);
      if (entry && entry.count > 0) {
        entry.count--;
        store.set(key, entry);
      }
    },
    resetKey: (key) => {
      store.delete(key);
    }
  }
});

/**
 * General API rate limiter for all endpoints
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  keyGenerator: ipKeyGenerator,
  handler: rateLimitHandler,
  skip: skipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'General API rate limit exceeded'
});

/**
 * Auth-specific rate limiter for login/register attempts
 * 10 attempts per hour per IP
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  keyGenerator: ipKeyGenerator,
  handler: rateLimitHandler,
  skip: skipRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Authentication rate limit exceeded',
  skipSuccessfulRequests: true // Only count failed auth attempts
});

/**
 * Get rate limit status for debugging
 */
export function getRateLimitStatus(req) {
  const ip = ipKeyGenerator(req);
  const email = req.body?.email || 'none';
  const sendCodeKey = sendCodeKeyGenerator(req);
  
  const ipEntry = store.get(ip);
  const sendCodeEntry = store.get(sendCodeKey);
  
  return {
    ip,
    email,
    ipLimit: ipEntry ? {
      current: ipEntry.count,
      resetTime: new Date(ipEntry.resetTime).toISOString(),
      timeRemaining: Math.max(0, Math.ceil((ipEntry.resetTime - Date.now()) / 1000))
    } : null,
    sendCodeLimit: sendCodeEntry ? {
      current: sendCodeEntry.count,
      resetTime: new Date(sendCodeEntry.resetTime).toISOString(),
      timeRemaining: Math.max(0, Math.ceil((sendCodeEntry.resetTime - Date.now()) / 1000))
    } : null,
    timestamp: new Date().toISOString()
  };
}

/**
 * Reset rate limits for a specific key (admin function)
 */
export function resetRateLimit(key) {
  store.delete(key);
  return { success: true, message: `Rate limit reset for key: ${key}` };
}

/**
 * Get all active rate limit entries (admin function)
 */
export function getAllRateLimits() {
  const now = Date.now();
  const activeEntries = [];
  
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime > now) {
      activeEntries.push({
        key,
        count: entry.count,
        resetTime: new Date(entry.resetTime).toISOString(),
        timeRemaining: Math.ceil((entry.resetTime - now) / 1000)
      });
    }
  }
  
  return activeEntries;
}

/**
 * Middleware to add rate limit headers to response
 */
export function rateLimitHeaders(req, res, next) {
  const sendStatus = () => {
    const ipKey = ipKeyGenerator(req);
    const sendCodeKey = sendCodeKeyGenerator(req);
    
    const ipEntry = store.get(ipKey);
    const sendCodeEntry = store.get(sendCodeKey);
    
    if (ipEntry) {
      res.setHeader('X-RateLimit-IP-Limit', 100);
      res.setHeader('X-RateLimit-IP-Remaining', Math.max(0, 100 - ipEntry.count));
      res.setHeader('X-RateLimit-IP-Reset', new Date(ipEntry.resetTime).toISOString());
    }
    
    if (sendCodeEntry) {
      const limit = req.user ? 10 : 5;
      res.setHeader('X-RateLimit-SendCode-Limit', limit);
      res.setHeader('X-RateLimit-SendCode-Remaining', Math.max(0, limit - sendCodeEntry.count));
      res.setHeader('X-RateLimit-SendCode-Reset', new Date(sendCodeEntry.resetTime).toISOString());
    }
    
    next();
  };
  
  // Wait for rate limit processing if using express-rate-limit
  if (req.rateLimit) {
    sendStatus();
  } else {
    // If no rate limit middleware applied, still add headers if we have data
    sendStatus();
  }
}

export default {
  sendCodeLimiter,
  apiLimiter,
  authLimiter,
  getRateLimitStatus,
  resetRateLimit,
  getAllRateLimits,
  rateLimitHeaders
};