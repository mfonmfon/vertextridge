const { supabase } = require('../config/supabase');

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

/**
 * Change user password
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Verify current password by attempting to sign in
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword
    });

    if (signInError) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user preferences
 */
exports.updatePreferences = async (req, res) => {
  const userId = req.user.id;
  const preferences = req.body;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        preferences: preferences,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: 'Preferences updated successfully',
      preferences: data.preferences
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user preferences
 */
exports.getPreferences = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.status(200).json({ preferences: data.preferences || {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload avatar
 */
exports.uploadAvatar = async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Upload to Supabase Storage
    const fileName = `${userId}-${Date.now()}.${file.mimetype.split('/')[1]}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update profile with new avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatar_url: publicUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
