import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiClock, FiSearch, FiRefreshCw, FiUser, FiMail } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const Messages = ({ providerId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [senderName, setSenderName] = useState('');

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.data && response.data.data) {
        // Group messages by conversation (sender-receiver pair)
        const groupedMessages = groupMessagesByConversation(response.data.data);
        setMessages(groupedMessages);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Group messages by conversation (sender-receiver pair)
  const groupMessagesByConversation = (messages) => {
    const conversations = {};
    
    messages.forEach(message => {
      const key = [message.sender_id, message.receiver_id].sort().join('-');
      
      if (!conversations[key]) {
        conversations[key] = {
          id: key,
          participants: {
            sender: message.sender,
            receiver: message.receiver
          },
          messages: []
        };
      }
      
      conversations[key].messages.push(message);
    });
    
    return Object.values(conversations);
  };

  // Fetch specific conversation
  const fetchConversation = async (conversationId) => {
    const conversation = messages.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      
      // Set the sender name for new messages
      const currentUserId = parseInt(localStorage.getItem('user_id'));
      const otherUser = conversation.participants.sender.id === currentUserId 
        ? conversation.participants.receiver 
        : conversation.participants.sender;
      
      // Use the sender_name from the last message if available, otherwise use the user's name
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      const nameToUse = lastMessage.sender_name || 
                       (lastMessage.sender_id === currentUserId ? lastMessage.sender.name : lastMessage.receiver.name);
      
      setSenderName(nameToUse);
    }
  };

  // Send new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const currentUserId = parseInt(localStorage.getItem('user_id'));
      const otherUser = selectedConversation.participants.sender.id === currentUserId 
        ? selectedConversation.participants.receiver 
        : selectedConversation.participants.sender;
      
      await axios.post('http://localhost:8000/api/messages', {
        receiver_id: otherUser.id,
        content: newMessage,
        sender_name: senderName // Include sender name in the request
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      // Refresh the messages
      fetchMessages();
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [providerId]);

  // Filter conversations based on search term
  const filteredConversations = messages.filter(conversation => {
    const latestMessage = conversation.messages[conversation.messages.length - 1];
    const currentUserId = parseInt(localStorage.getItem('user_id'));
    const otherUser = conversation.participants.sender.id === currentUserId 
      ? conversation.participants.receiver 
      : conversation.participants.sender;
    
    return (
      latestMessage.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchMessages}
          className="mt-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 flex items-center mx-auto"
        >
          <FiRefreshCw className="mr-2" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center">
          <FiMessageSquare className="text-yellow-400 text-2xl mr-3" />
          <h2 className="text-2xl font-bold text-white">Message Inbox</h2>
          <button
            onClick={fetchMessages}
            className="ml-4 p-2 text-gray-400 hover:text-yellow-400 transition"
          >
            <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden md:block md:w-1/3' : 'w-full'} border-r border-gray-800 overflow-y-auto`}>
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FiMessageSquare className="text-gray-600 text-4xl mb-4" />
              <h3 className="text-xl font-medium text-gray-400">No conversations yet</h3>
              <p className="text-gray-600 mt-2">Your messages will appear here</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const latestMessage = conversation.messages[conversation.messages.length - 1];
              const currentUserId = parseInt(localStorage.getItem('user_id'));
              const otherUser = conversation.participants.sender.id === currentUserId 
                ? conversation.participants.receiver 
                : conversation.participants.sender;
              
              const unreadCount = conversation.messages.filter(
                msg => !msg.is_read && msg.receiver_id === currentUserId
              ).length;

              // Use sender_name if available, otherwise fall back to user name
              const displayName = latestMessage.sender_name || 
                                (latestMessage.sender_id === currentUserId 
                                  ? latestMessage.sender.name 
                                  : latestMessage.receiver.name);

              return (
                <motion.div
                  key={conversation.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 border-b border-gray-800 cursor-pointer transition-all flex items-center
                    ${unreadCount > 0 ? 'bg-yellow-400/5' : 'bg-gray-900'}`}
                  onClick={() => fetchConversation(conversation.id)}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-yellow-400">
                      {displayName.charAt(0)}
                    </div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-xs text-black">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-white truncate">{displayName}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(latestMessage.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {latestMessage.sender_id === currentUserId ? 'You: ' : ''}
                      {latestMessage.content}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Conversation View */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-800 flex items-center bg-gray-900">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden mr-4 text-gray-400 hover:text-white"
              >
                &larr;
              </button>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-yellow-400">
                {selectedConversation.participants.sender.name.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-white">
                  {selectedConversation.messages[0]?.sender_name || selectedConversation.participants.sender.name}
                </h3>
                <p className="text-xs text-gray-400">{selectedConversation.participants.sender.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900/50">
              {selectedConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages in this conversation</p>
                </div>
              ) : (
                selectedConversation.messages.map((message) => {
                  const currentUserId = parseInt(localStorage.getItem('user_id'));
                  const isCurrentUser = message.sender_id === currentUserId;
                  const displayName = message.sender_name || 
                                    (isCurrentUser ? message.sender.name : message.receiver.name);

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md p-3 rounded-lg ${isCurrentUser
                          ? 'bg-yellow-400/20 border border-yellow-400/30'
                          : 'bg-gray-800 border border-gray-700'}`}
                      >
                        {!isCurrentUser && (
                          <p className="text-xs text-yellow-400 mb-1">{displayName}</p>
                        )}
                        <p className="text-white">{message.content}</p>
                        <div className="flex items-center justify-end mt-1">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                          {isCurrentUser && (
                            <span className="ml-1 text-xs text-gray-500">
                              {message.is_read ? '✓ Read' : '✓ Sent'}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-400 mr-2">From:</span>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !senderName.trim()}
                    className="px-6 py-3 bg-yellow-400 text-black font-medium rounded-r-lg hover:bg-yellow-500 transition disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-900/50">
            <div className="text-center p-8 max-w-md">
              <FiMail className="mx-auto text-gray-600 text-5xl mb-4" />
              <h3 className="text-xl font-medium text-gray-400">Select a conversation</h3>
              <p className="text-gray-600 mt-2">Choose a conversation from the list to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;