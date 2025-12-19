import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

/**
 * Authentication middleware that verifies JWT token from Authorization header
 * Attaches decoded user payload to req.user
 */
export const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Please provide an authentication token'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user data to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
        message: 'Invalid authentication token'
      });
    }

    // Other errors (e.g., not before, etc.)
    return res.status(403).json({
      success: false,
      error: 'Authentication failed',
      message: 'Failed to authenticate token'
    });
  }
};

/**
 * Optional middleware to require verified email
 */
export const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email not verified',
      message: 'Please verify your email address to access this resource'
    });
  }
  next();
};

export default authenticateToken;