import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Terminal,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Timer,
  RefreshCw
} from 'lucide-react';
import SEO from '../components/SEO';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleSendCode = async () => {
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!validateEmail(email)) {
      setErrors({ email: 'Invalid email format' });
      return;
    }

    setIsSendingCode(true);
    setMessage({ type: '', text: '' });
    setErrors({});

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'login' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Verification code sent to your email' });
        setCountdown(60); // 60 second countdown
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!email) validationErrors.email = 'Email is required';
    else if (!validateEmail(email)) validationErrors.email = 'Invalid email format';

    if (!code) validationErrors.code = 'Verification code is required';
    else if (code.length !== 6) validationErrors.code = 'Code must be 6 digits';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent('loginSuccess'));
        
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        
        // Redirect to home page after short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Login failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center p-4">
      <SEO
        title="Login"
        description="Login to your DeepSeek CLI account with email verification code."
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header with Terminal icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-900/30 to-purple-900/30 border border-primary-800/50 backdrop-blur-sm mb-4">
            <Terminal className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-dark-300">Sign in with your email and verification code</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="card bg-dark-900/50 border border-dark-800 rounded-2xl backdrop-blur-xl p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-emerald-900/30 border-emerald-800/50 text-emerald-300' 
                : 'bg-red-900/30 border-red-800/50 text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-dark-800/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-white placeholder-dark-500 ${
                    errors.email ? 'border-red-500' : 'border-dark-700'
                  }`}
                  placeholder="you@example.com"
                  disabled={isLoading || isSendingCode}
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Send Code Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSendingCode || countdown > 0 || isLoading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  countdown > 0
                    ? 'bg-dark-800 text-dark-400 cursor-not-allowed'
                    : isSendingCode
                    ? 'bg-primary-800 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {isSendingCode ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Timer className="w-5 h-5 mr-2" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Send Code
                  </>
                )}
              </button>
            </div>

            {/* Verification Code Input */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Verification Code (6 digits)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-500 w-5 h-5" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(val);
                  }}
                  className={`w-full pl-12 pr-4 py-3 bg-dark-800/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-white placeholder-dark-500 ${
                    errors.code ? 'border-red-500' : 'border-dark-700'
                  }`}
                  placeholder="Enter 6-digit code"
                  disabled={isLoading || isSendingCode}
                />
              </div>
              {errors.code && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.code}
                </div>
              )}
              <p className="text-xs text-dark-500 mt-2">
                Enter the 6-digit verification code sent to your email
              </p>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || isSendingCode}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
                isLoading
                  ? 'bg-primary-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Link to Register */}
          <div className="mt-8 pt-6 border-t border-dark-800 text-center">
            <p className="text-dark-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                Create account
              </Link>
            </p>
          </div>

          {/* Demo note */}
          <div className="mt-6 p-4 bg-dark-800/30 rounded-lg border border-dark-800">
            <p className="text-sm text-dark-400 text-center">
              For demo purposes, you can use any email address. The verification code will be logged in the server console.
            </p>
          </div>

          {/* Demo note */}
          <div className="mt-6 p-4 bg-dark-800/30 rounded-lg border border-dark-800">
            <p className="text-sm text-dark-400 text-center">
              For demo purposes, you can use any email address. The verification code will be logged in the server console.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;