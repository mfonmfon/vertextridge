const { supabase } = require('../config/supabase');
const Logger = require('../utils/logger');
const logger = new Logger('AUTH_MIDDLEWARE');

/**
 * Production-Grade Authentication Middleware
 * Verifies Supabase JWT and attaches user to request
 */
const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Debug logging
  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('Path:', req.path);
  console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('Token extracted:', token ? `${token.substring(0, 20)}...` : 'None');

  if (!token) {
    logger.warn('Auth attempt without token', {
      ip: req.ip,
      path: req.path
    });
    return res.status(401).json({ 
      error: 'Not authorized, no token provided',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    console.log('Supabase auth result:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error: error?.message
    });

    if (error || !user) {
      logger.warn('Invalid token attempt', {
        ip: req.ip,
        error: error?.message,
        tokenPreview: token.substring(0, 20)
      });
      return res.status(401).json({ 
        error: 'Not authorized, invalid token',
        code: 'INVALID_TOKEN',
        details: error?.message
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;
    
    logger.debug('User authenticated', {
      userId: user.id,
      email: user.email
    });

    next();
  } catch (err) {
    logger.error('Auth middleware error', {
      error: err.message,
      stack: err.stack
    });
    res.status(401).json({ 
      error: 'Not authorized, token failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional middleware to check KYC status
 */
const requireKYC = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    if (profile.kyc_status !== 'verified') {
      return res.status(403).json({
        error: 'KYC verification required',
        code: 'KYC_REQUIRED',
        kycStatus: profile.kyc_status
      });
    }

    next();
  } catch (err) {
    logger.error('KYC check failed', { error: err.message });
    res.status(500).json({ error: 'KYC verification check failed' });
  }
};

module.exports = { protect, requireKYC };
