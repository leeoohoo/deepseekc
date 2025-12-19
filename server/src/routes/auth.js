import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import VerificationCode from '../models/VerificationCode.js';
import { 
  sendAndStoreVerificationCode, 
  generateVerificationCode,
  calculateExpirationTime 
} from '../services/email.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendCodeLimiter } from '../middleware/rateLimiters.js';
import { asyncHandler, logEvent } from '../middleware/errorHandler.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper function to generate JWT token
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    isVerified: user.isVerified,
    myReferralCode: user.myReferralCode
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Helper function to clean user object for response
const cleanUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  const { verificationCode, verificationCodeExpires, __v, ...clean } = userObj;
  return clean;
};

/**
 * POST /send-code
 * Send verification code to email for registration or login
 * Body: { email, type: 'register' | 'login' }
 * Rate limited: 5 attempts per 15 minutes per IP, 3 attempts per 15 minutes per email
 */
router.post('/send-code', 
  sendCodeLimiter, // Apply rate limiting
  [
    body('email')
      .trim()
      .toLowerCase()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('type')
      .trim()
      .notEmpty().withMessage('Type is required')
      .isIn(['register', 'login']).withMessage('Type must be either register or login')
  ],
  asyncHandler(async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logEvent('validation_failed', {
          endpoint: '/send-code',
          errors: errors.array()
        });
        
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid input',
          details: errors.array().map(err => ({
            field: err.path,
            message: err.msg
          }))
        });
      }

      const { email, type } = req.body;
      
      // Check if user exists for login type
      if (type === 'login') {
        const userExists = await User.findOne({ email });
        if (!userExists) {
          return res.status(400).json({
            success: false,
            error: 'UserNotFound',
            message: 'User not found. Please register first.'
          });
        }
      }

      // Generate verification code and expiration time
      const code = generateVerificationCode();
      const expiresAt = calculateExpirationTime(10); // 10 minutes

      // Send email and store verification code (transactional)
      await sendAndStoreVerificationCode(email, code, type, expiresAt, async () => {
        // Store verification code only after successful email send
        await VerificationCode.create({
          email,
          code,
          type,
          expiresAt
        });
      });

      res.status(200).json({
        success: true,
        message: 'Verification code sent to email',
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      // Error will be handled by errorHandlerMiddleware
      throw error;
    }
  })
);

/**
 * POST /register
 * Register new user with email and verification code
 * Body: { email, code, referralCode? }
 */
router.post('/register',
  [
    body('email')
      .trim()
      .toLowerCase()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('code')
      .trim()
      .notEmpty().withMessage('Verification code is required')
      .isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
    body('referralCode')
      .optional()
      .trim()
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Invalid input',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { email, code, referralCode } = req.body;

    // Verify code from VerificationCode model with type 'register'
    const verificationCode = await VerificationCode.findOne({
      email,
      code,
      type: 'register',
      expiresAt: { $gt: new Date() }
    });

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'InvalidVerificationCode',
        message: 'Invalid or expired verification code'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        error: 'UserAlreadyExists',
        message: 'User already exists'
      });
    }

    // Create new user with referralCode if provided
    user = new User({
      email,
      verificationCode: null,
      verificationCodeExpires: null,
      referralCode: referralCode || null,
      isVerified: true
    });

    await user.save();

    // Delete used verification code
    await VerificationCode.deleteMany({ email });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      user: cleanUser(user),
      token
    });
  })
);

/**
 * POST /login
 * Login with email and verification code
 * Body: { email, code }
 */
router.post('/login',
  [
    body('email')
      .trim()
      .toLowerCase()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('code')
      .trim()
      .notEmpty().withMessage('Verification code is required')
      .isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Invalid input',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    const { email, code } = req.body;

    // Verify code from VerificationCode model with type 'login'
    const verificationCode = await VerificationCode.findOne({
      email,
      code,
      type: 'login',
      expiresAt: { $gt: new Date() }
    });

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'InvalidVerificationCode',
        message: 'Invalid or expired verification code'
      });
    }

    // Find user by email (must exist)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'UserNotFound',
        message: 'User not found. Please register first.'
      });
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Delete used verification code
    await VerificationCode.deleteMany({ email });

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      user: cleanUser(user),
      token
    });
  })
);

/**
 * GET /me
 * Get current user profile (protected)
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select('-verificationCode -verificationCodeExpires -__v');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'UserNotFound',
      message: 'User not found'
    });
  }

  res.status(200).json({
    user: cleanUser(user)
  });
}));

export default router;