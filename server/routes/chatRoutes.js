const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get or create conversation for user
const getOrCreateConversation = async (userId, userName, userEmail) => {
  try {
    // First try to find existing active conversation
    let { data: conversation, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    // If no active conversation, create new one
    if (!conversation) {
      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          status: 'active'
        })
        .select()
        .single();

      if (createError) throw createError;
      conversation = newConversation;
    }

    return conversation;
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw error;
  }
};

// Chat endpoint for the chatbot
router.post('/chat', async (req, res) => {
  try {
    const { message, userId, userName, userEmail } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If user info provided, store in database and return admin response message
    if (userId && userName && userEmail) {
      try {
        // Get or create conversation
        const conversation = await getOrCreateConversation(userId, userName, userEmail);

        // Store user message
        await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversation.id,
            sender_type: 'user',
            sender_id: userId,
            sender_name: userName,
            message: message
          });

        // Update conversation last message time
        await supabase
          .from('chat_conversations')
          .update({ 
            last_message_at: new Date().toISOString(),
            status: 'pending' // Mark as pending admin response
          })
          .eq('id', conversation.id);

        // Always return message indicating admin will respond
        return res.json({ 
          response: "Thank you for your message! Our support team will respond to you shortly. Please check back in a few minutes.",
          conversationId: conversation.id
        });

      } catch (dbError) {
        console.error('Database error:', dbError);
        // If database fails, still return admin response message
        return res.json({ 
          response: "Thank you for your message! Our support team will respond to you shortly. Please check back in a few minutes."
        });
      }
    }

    // For users not logged in, return a generic message
    return res.json({ 
      response: "Thank you for contacting VertexTridge support! Please log in to your account for personalized assistance, or our team will respond to you shortly."
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Sorry, I\'m having trouble processing your request right now. Please try again later.' 
    });
  }
});

// Get conversations for admin
router.get('/admin/conversations', async (req, res) => {
  try {
    const { data: conversations, error } = await supabase
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
router.get('/admin/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: messages, error } = await supabase
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
router.post('/admin/conversations/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, adminName } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Insert admin message
    const { data: newMessage, error: messageError } = await supabase
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
    await supabase
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
router.patch('/admin/conversations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabase
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