const { supabase } = require('../config/supabase');
const Logger = require('../utils/logger');
const { asyncHandler } = require('../utils/errorHandler');

const logger = new Logger('ONBOARDING_CONTROLLER');

/**
 * Submit onboarding details
 */
exports.submitOnboarding = asyncHandler(async (req, res) => {
  const userId = req.user.id; // always from JWT, never from body
  const { experience, goals, riskTolerance, dob, nationality, phone, occupation, address, city, postalCode, state, country } = req.body;

  logger.info('Submitting onboarding', { userId });

  // For now, we'll just mark that a document was uploaded
  // In a real implementation, you'd handle file upload to storage
  const documentUploaded = req.body.documentUploaded || false;

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      experience_level: experience || occupation,
      investment_goals: goals ? [goals] : ['growth'],
      risk_tolerance: riskTolerance || 'medium',
      date_of_birth: dob || null,
      nationality: nationality || null,
      phone: phone || null,
      occupation: occupation || null,
      address: address || null,
      city: city || null,
      postal_code: postalCode || null,
      state: state || null,
      country: country || null,
      document_url: documentUploaded ? 'document_uploaded' : null,
      onboarding_completed: true,
      kyc_status: 'pending',
      updated_at: new Date()
    })
    .select()
    .single();

  if (error) throw error;

  logger.info('Onboarding completed', { userId });

  res.status(200).json({
    message: 'Onboarding completed successfully',
    profile: data,
  });
});

/**
 * Get user profile/onboarding status
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  logger.debug('Fetching profile', { userId });

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Profile fetch error', { userId, error: error.message });
    throw error;
  }

  // Debug logging
  console.log('📤 SERVER: Sending profile data:', {
    profit: data?.profit,
    total_holdings: data?.total_holdings,
    portfolio_value: data?.portfolio_value,
    balance: data?.balance
  });

  res.status(200).json({
    profile: data || null,
  });
});
