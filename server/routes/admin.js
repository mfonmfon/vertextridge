const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminProtect, superAdminProtect } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');
const { supabaseAdmin } = require('../config/supabase');

// All routes require authentication AND admin privileges
// TEMPORARY: Bypass admin auth for testing
// router.use(protect);
// router.use(adminProtect);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/balance', adminController.updateUserBalance);
router.patch('/users/:userId/profile', adminController.updateUserProfile);
router.patch('/users/:userId/kyc', adminController.updateKYCStatus);
router.delete('/users/:userId', superAdminProtect, adminController.deleteUser); // Only super admin can delete

// Wallet management
router.post('/users/:userId/wallet', adminController.generateWalletAddress);
router.get('/users/:userId/wallets', adminController.getUserWallets);

// Platform settings
router.get('/settings', adminController.getSettings);
router.put('/settings', superAdminProtect, adminController.updateSetting); // Only super admin can update settings

// Activity logs
router.get('/activity-logs', adminController.getActivityLogs);

// ═══════════════════════════════════════════════════════════════
// CHAT SUPPORT ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// Get conversations for admin
router.get('/conversations', async (req, res) => {
  try {
    const { data: conversations, error } = await supabaseAdmin
      .from('chat_conversations')
      .select(`
        *,
        chat_messages (
          id,
          message,
          sender_type,
          sender_name,
          created_at
        )
      `)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Get latest message for each conversation
    const conversationsWithLatest = conversations.map(conv => ({
      ...conv,
      latest_message: conv.chat_messages?.[conv.chat_messages.length - 1] || null,
      unread_count: conv.chat_messages?.filter(msg => 
        msg.sender_type === 'user' && 
        new Date(msg.created_at) > new Date(conv.last_message_at || 0)
      ).length || 0
    }));

    res.json({ conversations: conversationsWithLatest });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send admin reply
router.post('/conversations/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, adminName } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Insert admin message
    const { data: newMessage, error: messageError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        conversation_id: id,
        sender_type: 'admin',
        sender_name: adminName || 'Support Team',
        message: message
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Update conversation status and last message time
    await supabaseAdmin
      .from('chat_conversations')
      .update({ 
        last_message_at: new Date().toISOString(),
        status: 'active'
      })
      .eq('id', id);

    res.json({ message: newMessage });
  } catch (error) {
    console.error('Error sending admin reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// Update conversation status
router.patch('/conversations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabaseAdmin
      .from('chat_conversations')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
