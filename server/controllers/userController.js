const supabase = require('../config/supabase');

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.status(200).json({ profile: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
