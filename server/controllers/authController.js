const { supabase } = require('../config/supabase');
const { OAuth2Client } = require('google-auth-library');
const Logger = require('../utils/logger');
const { asyncHandler } = require('../utils/errorHandler');

const logger = new Logger('AUTH_CONTROLLER');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Register a new user with Production-Grade Logic
 */
exports.signup = asyncHandler(async (req, res) => {
  const { email, password, fullName, country } = req.body;

  logger.audit('SIGNUP_ATTEMPT', { email });

  // 1. Supabase Auth Signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        country: country
      },
    },
  });

  if (error) {
    logger.warn('Signup failed', { email, error: error.message });
    return res.status(400).json({ 
      error: error.message,
      code: 'SIGNUP_FAILED'
    });
  }

  if (!data.user) {
    return res.status(500).json({ 
      error: 'User creation failed',
      code: 'USER_CREATION_FAILED'
    });
  }

  // 2. Create profile with transaction safety
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      name: fullName,
      country: country,
      email: email,
      balance: 10000.00,
      kyc_status: 'unverified',
      created_at: new Date()
    }, { onConflict: 'id' });

  if (profileError) {
    logger.error('Profile creation failed', { 
      userId: data.user.id, 
      error: profileError.message 
    });
    // Don't fail the signup, profile can be created later
  }

  // 3. Audit log
  await supabase.from('audit_logs').insert({
    user_id: data.user.id,
    action: 'USER_SIGNUP',
    resource: 'auth',
    details: { email, method: 'email', country },
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });

  logger.audit('SIGNUP_SUCCESS', { userId: data.user.id, email });

  res.status(201).json({
    message: 'Signup successful',
    user: {
      ...data.user,
      name: fullName,
      country: country
    },
    session: data.session,
  });
});

/**
 * Login with Production-Grade Security
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  logger.audit('LOGIN_ATTEMPT', { email });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.warn('Login failed', { email, error: error.message });
    
    // Audit failed login
    await supabase.from('audit_logs').insert({
      action: 'LOGIN_FAILED',
      resource: 'auth',
      details: { email, reason: error.message },
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    return res.status(401).json({ 
      error: 'Invalid credentials provided',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Audit successful login
  await supabase.from('audit_logs').insert({
    user_id: data.user.id,
    action: 'LOGIN_SUCCESS',
    resource: 'auth',
    details: { email },
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });

  logger.audit('LOGIN_SUCCESS', { userId: data.user.id, email });

  res.status(200).json({
    message: 'Login successful',
    user: data.user,
    session: data.session,
  });
});

/**
 * Google OAuth with Production Security
 */
exports.googleAuth = asyncHandler(async (req, res) => {
  const { credential, country } = req.body;

  if (!credential) {
    return res.status(400).json({ 
      error: 'Missing Google credential token',
      code: 'MISSING_CREDENTIAL'
    });
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  logger.audit('GOOGLE_AUTH_VERIFIED', { email, googleId });

  // Check if user exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  let profile;
  if (existingProfile) {
    // Update existing profile
    const { data: updated } = await supabase
      .from('profiles')
      .update({
        name: name,
        avatar_url: picture,
        updated_at: new Date()
      })
      .eq('id', existingProfile.id)
      .select()
      .single();
    
    profile = updated;
  } else {
    // Create new profile for Google user
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: googleId,
        name: name,
        email: email,
        country: country || 'Not specified',
        avatar_url: picture,
        balance: 10500.25,
        kyc_status: 'unverified'
      })
      .select()
      .single();
    
    profile = newProfile;
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: profile.id,
    action: 'GOOGLE_AUTH_SUCCESS',
    resource: 'auth',
    details: { email, method: 'google', country: country || 'Not specified' },
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });

  logger.audit('GOOGLE_AUTH_SUCCESS', { email });

  res.json({
    success: true,
    user: {
      id: profile.id,
      name,
      email,
      country: profile.country,
      picture,
      balance: profile.balance,
      kycStatus: profile.kyc_status,
      isGoogle: true
    },
    message: 'Google authentication successful',
  });
});

/**
 * Secure Logout
 */
exports.logout = asyncHandler(async (req, res) => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    logger.error('Logout failed', { error: error.message });
    throw error;
  }

  res.json({ 
    message: 'Session terminated successfully',
    code: 'LOGOUT_SUCCESS'
  });
});
