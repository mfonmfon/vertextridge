import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import { useUser } from '../context/UserContext';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing conversation when chat opens
  useEffect(() => {
    if (isOpen && user && !conversationId) {
      loadExistingConversation();
    }
  }, [isOpen, user]);

  // Poll for new messages when chat is open
  useEffect(() => {
    if (isOpen && conversationId) {
      // Fetch immediately
      fetchMessages();
      
      // Then poll every 5 seconds
      const interval = setInterval(() => {
        fetchMessages();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId]);

  const loadExistingConversation = async () => {
    if (!user) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/chat/user/${user.id}/conversation`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.conversation) {
          setConversationId(data.conversation.id);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/chat/conversation/${conversationId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.messages && data.messages.length > 0) {
          const formattedMessages = data.messages.map(msg => ({
            id: msg.id,
            text: msg.message,
            sender: msg.sender_type === 'admin' ? 'bot' : 'user',
            timestamp: new Date(msg.created_at)
          }));
          
          setMessages([
            {
              id: 1,
              text: "Hi! How can I help you today?",
              sender: 'bot',
              timestamp: new Date()
            },
            ...formattedMessages
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const requestBody = {
        message: inputText
      };

      // Add user info if logged in
      if (user) {
        requestBody.userId = user.id;
        requestBody.userName = user.name;
        requestBody.userEmail = user.email;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      // Store conversation ID for polling
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Bubble */}
      <div 
        className={`chat-bubble ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
        </svg>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <h3>VertexTridge Support</h3>
              <div className="status-indicator">
                <span className="status-dot online"></span>
                <span>Online</span>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-bubble">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message">
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTyping}
            />
            <button 
              onClick={sendMessage}
              disabled={!inputText.trim() || isTyping}
              className="send-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;