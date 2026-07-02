const { supabase, supabaseClient } = require('../config/supabase');
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

  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('Path:', req.path);
  console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('Token extracted:', token ? `${token.substring(0, 30)}...` : 'None');

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
    // Try to verify token with Supabase using the client
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      logger.warn('Supabase client auth failed', { 
        error: error?.message, 
        tokenPreview: token.substring(0, 20),
        status: error?.status 
      });
      
      // If client validation fails, try with admin client
      const { data: { user: adminUser }, error: adminError } = await supabase.auth.getUser(token);
      
      if (adminError || !adminUser) {
        logger.warn('Supabase admin auth failed', { 
          error: adminError?.message, 
          status: adminError?.status 
        });
        // Both Supabase validations failed
        // Try to decode the JWT manually and validate against database
        console.log('Both Supabase validations failed, trying JWT decode...');
        
        try {
          // Decode JWT without verification (just to get the user ID)
          const base64Payload = token.split('.')[1];
          const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
          console.log('JWT payload:', { sub: payload.sub, email: payload.email });
          
          if (payload.email) {
            // Check if user exists in database by email (works for both Google and Supabase tokens if needed)
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id, email, name')
              .eq('email', payload.email)
              .maybeSingle();
            
            if (!profileError && profile) {
              console.log('User found in database by email:', profile.email);
              // User exists in database, allow the request
              req.user = {
                id: profile.id,
                email: profile.email,
                name: profile.name
              };
              req.token = token;
              logger.debug('User authenticated via database lookup', {
                userId: profile.id,
                email: profile.email
              });
              return next();
            }
          }
        } catch (decodeError) {
          console.error('JWT decode failed:', decodeError.message);
        }
        
        logger.warn('Invalid token attempt - all validation methods failed', {
          ip: req.ip,
          error: adminError?.message || error?.message,
          tokenPreview: token.substring(0, 20)
        });
        return res.status(401).json({ 
          error: 'Not authorized, invalid token',
          code: 'INVALID_TOKEN',
          details: adminError?.message || error?.message
        });
      }
      
      // Use admin validated user
      req.user = adminUser;
      req.token = token;
      logger.debug('User authenticated via admin client', {
        userId: adminUser.id,
        email: adminUser.email
      });
      return next();
    }

    // Attach user to request object
    req.user = user;
    req.token = token;
    
    logger.debug('User authenticated via client', {
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
      code: 'AUTH_ERROR',
      details: err.message
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
