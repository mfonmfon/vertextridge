const supabase = require('../config/supabase');

/**
 * Toggle an asset in the user's watchlist
 */
exports.toggleWatchlist = async (req, res) => {
  const { assetId } = req.body;
  const userId = req.user.id;

  if (!assetId) {
    return res.status(400).json({ error: 'Asset ID is required' });
  }

  try {
    // Check if it exists
    const { data: existing, error: fetchErr } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .eq('asset_id', assetId)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr;

    if (existing) {
      // Remove it
      const { error: delErr } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', existing.id);
      
      if (delErr) throw delErr;
      
      return res.status(200).json({ message: 'Removed from watchlist', action: 'removed' });
    } else {
      // Add it
      const { error: insErr } = await supabase
        .from('watchlist')
        .insert({
          user_id: userId,
          asset_id: assetId,
          created_at: new Date()
        });
      
      if (insErr) throw insErr;
      
      return res.status(200).json({ message: 'Added to watchlist', action: 'added' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's watchlist
 */
exports.getWatchlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('asset_id')
      .eq('user_id', userId);

    if (error) throw error;

    const assetIds = data.map(item => item.asset_id);
    res.status(200).json({ watchlist: assetIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
