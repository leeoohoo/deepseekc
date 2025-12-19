import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{6}$/, 'Verification code must be 6 digits']
  },
  type: {
    type: String,
    required: true,
    enum: ['register', 'login'],
    default: 'register'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index to auto-delete expired documents
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Compound index for faster lookups by email and code
verificationCodeSchema.index({ email: 1, code: 1 });
// Index for type if needed
verificationCodeSchema.index({ type: 1 });

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

export default VerificationCode;