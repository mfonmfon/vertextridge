import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Clock, User, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, Button, Input } from '../../component/shared/UI';
import toast from 'react-hot-toast';
import Avatar from '../../component/Avatar';

const AdminChatSupport = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    // Refresh conversations every 30 seconds
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/admin/conversations`);
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/admin/conversations/${conversationId}/messages`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendReply = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/admin/conversations/${selectedConversation.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          adminName: 'Support Team'
        }),
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages(selectedConversation.id);
        loadConversations(); // Refresh conversation list
        toast.success('Reply sent successfully');
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const updateConversationStatus = async (conversationId, status) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/admin/conversations/${conversationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        loadConversations();
        toast.success(`Conversation ${status}`);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'closed': return 'text-gray-400';
      default: return 'text-white/60';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Chat Support</h1>
          <p className="text-white/60 mt-1">Manage customer support conversations</p>
        </div>
        <Button 
          onClick={loadConversations} 
          variant="secondary"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="p-4 overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Conversations ({conversations.length})</h2>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar 
                      user={{ name: conversation.user_name, email: conversation.user_email }} 
                      size={32} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {conversation.user_name}
                        </span>
                        <div className={`flex items-center gap-1 ${getStatusColor(conversation.status)}`}>
                          {getStatusIcon(conversation.status)}
                        </div>
                      </div>
                      <p className="text-xs text-white/60 truncate mb-1">
                        {conversation.user_email}
                      </p>
                      {conversation.latest_message && (
                        <p className="text-xs text-white/40 truncate">
                          {conversation.latest_message.message}
                        </p>
                      )}
                      <p className="text-xs text-white/30 mt-1">
                        {new Date(conversation.last_message_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2 p-4 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Avatar 
                    user={{ 
                      name: selectedConversation.user_name, 
                      email: selectedConversation.user_email 
                    }} 
                    size={40} 
                  />
                  <div>
                    <h3 className="font-semibold">{selectedConversation.user_name}</h3>
                    <p className="text-sm text-white/60">{selectedConversation.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedConversation.status}
                    onChange={(e) => updateConversationStatus(selectedConversation.id, e.target.value)}
                    className="bg-surface border border-white/10 rounded px-3 py-1 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.sender_type === 'admin' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender_type === 'admin'
                            ? 'bg-primary text-white'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-xs text-white/40">
                          {message.sender_name}
                        </span>
                        <span className="text-xs text-white/30">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your reply..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button
                  onClick={sendReply}
                  disabled={!newMessage.trim() || sending}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminChatSupport;