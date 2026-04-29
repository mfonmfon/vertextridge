const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

// Get or create conversation for user
const getOrCreateConversation = async (userId, userName, userEmail) => {
  try {
    // First try to find existing active conversation
    let { data: conversation, error } = await supabaseAdmin
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
      const { data: newConversation, error: createError } = await supabaseAdmin
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
        await supabaseAdmin
          .from('chat_messages')
          .insert({
            conversation_id: conversation.id,
            sender_type: 'user',
            sender_id: userId,
            sender_name: userName,
            message: message
          });

        // Update conversation last message time
        await supabaseAdmin
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

// Get user's active conversation
router.get('/chat/user/:userId/conversation', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: conversation, error } = await supabaseAdmin
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ conversation: conversation || null });
  } catch (error) {
    console.error('Error fetching user conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Get conversation messages for user
router.get('/chat/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;