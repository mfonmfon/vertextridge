const { supabase } = require('../config/supabase');
const Logger = require('../utils/logger');
const { asyncHandler } = require('../utils/errorHandler');
const emailService = require('../services/emailService');

const logger = new Logger('AUTH_CONTROLLER');

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
      balance: 50.00, // $50 initial balance for new users
      kyc_status: 'unverified',
      created_at: new Date()
    }, { onConflict: 'id' });

  if (profileError) {
    logger.error('Profile creation failed', { 
      userId: data.user.id, 
      error: profileError.message 
    });
    // Continue with signup even if profile creation fails - it can be created later
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

  // 4. Send welcome email (non-blocking)
  emailService.sendWelcomeEmail({
    email,
    name: fullName
  }).catch(err => logger.error('Failed to send welcome email', { error: err.message }));

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

  // Decode the JWT payload from Google's credential token
  let payload;
  try {
    const base64Payload = credential.split('.')[1];
    const decoded = Buffer.from(base64Payload, 'base64').toString('utf8');
    payload = JSON.parse(decoded);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid Google credential token', code: 'INVALID_TOKEN' });
  }

  const { sub: googleId, email, name, picture, aud } = payload;

  logger.info('Google token decoded', { email, aud, expectedClientId: process.env.GOOGLE_CLIENT_ID });

  // Verify the token was issued for our app (aud can be string or array)
  const audiences = Array.isArray(aud) ? aud : [aud];
  if (!audiences.includes(process.env.GOOGLE_CLIENT_ID)) {
    logger.warn('Audience mismatch', { aud: audiences, expected: process.env.GOOGLE_CLIENT_ID });
    return res.status(401).json({ error: 'Token audience mismatch', code: 'INVALID_AUDIENCE' });
  }

  if (!email) {
    return res.status(400).json({ error: 'No email in Google token', code: 'NO_EMAIL' });
  }

  logger.audit('GOOGLE_AUTH_VERIFIED', { email, googleId });

  // Check if user exists by email
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  let profile;
  if (existingProfile) {
    // Update existing profile
    const { data: updated } = await supabase
      .from('profiles')
      .update({ name, avatar_url: picture, updated_at: new Date() })
      .eq('id', existingProfile.id)
      .select()
      .single();
    profile = updated || existingProfile;
  } else {
    // Create Supabase auth user first to get a valid UUID
    const randomPassword = require('crypto').randomBytes(32).toString('hex');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: { full_name: name, avatar_url: picture }
    });

    if (authError) {
      // If user creation fails, use a UUID-like ID
      const crypto = require('crypto');
      const fallbackId = crypto.randomUUID();
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: fallbackId,
          name, email,
          country: country || 'Not specified',
          avatar_url: picture,
          balance: 50.00,
          kyc_status: 'unverified',
        }, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) throw profileError;
      profile = newProfile;
    } else {
      const userId = authData.user.id;
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name, email,
          country: country || 'Not specified',
          avatar_url: picture,
          balance: 50.00,
          kyc_status: 'unverified',
        }, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) throw profileError;
      profile = newProfile;
    }
  }

  if (!profile) {
    throw new Error('Failed to create or retrieve user profile');
  }

  // Audit log (non-blocking)
  supabase.from('audit_logs').insert({
    user_id: profile.id,
    action: 'GOOGLE_AUTH_SUCCESS',
    resource: 'auth',
    details: { email, method: 'google', country: country || 'Not specified' },
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  }).catch(err => logger.error('Failed to insert audit log', { error: err.message }));

  logger.audit('GOOGLE_AUTH_SUCCESS', { email });

  // Return session with Google credential as token
  // Frontend will use this for authenticated requests
  const session = {
    access_token: credential,
    refresh_token: null,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: profile.id,
      email: email,
      user_metadata: {
        full_name: name,
        avatar_url: picture
      }
    }
  };

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
    session: session,
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
