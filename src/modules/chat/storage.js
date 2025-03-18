// modules/chat/storage.js

// Store for chat messages and state
let chatMessages = [];
let conversations = new Map(); // Store conversations by ID
let userListeners = [];
let lastMessageTimestamp = null;

// New stores for channels and DMs
let channels = [];
let directMessages = [];

/**
 * Add a new message to the chat messages store
 * @param {Object} message - The message object to add
 */
export function addNewMessage(message) {
  if (!message || !message.text) return;
  
  // Add message to conversations map
  if (message.conversationId) {
    if (!conversations.has(message.conversationId)) {
      conversations.set(message.conversationId, {
        id: message.conversationId,
        name: message.sender,
        lastMessage: message.text,
        lastTimestamp: message.timestamp,
        messages: [message],
        unreadCount: message.isRead ? 0 : 1
      });
    } else {
      const conversation = conversations.get(message.conversationId);
      
      // Update conversation details
      conversation.lastMessage = message.text;
      conversation.lastTimestamp = message.timestamp;
      
      // Only update name if we have a valid sender
      if (message.sender && message.sender.trim() !== "") {
        conversation.name = message.sender;
      }
      
      // Add to messages array
      conversation.messages.push(message);
      
      // Update unread count
      if (!message.isRead) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }
      
      // Keep only last 50 messages per conversation
      if (conversation.messages.length > 50) {
        conversation.messages = conversation.messages.slice(-50);
      }
    }
  }
  
  // Check if this is a genuinely new message
  // Compare with the most recent timestamp we have
  let isNewMessage = true;
  if (lastMessageTimestamp) {
    // Parse timestamps to compare
    try {
      const currentTime = new Date(message.timestamp).getTime();
      const lastTime = new Date(lastMessageTimestamp).getTime();
      
      isNewMessage = currentTime > lastTime;
    } catch (e) {
      // If parsing fails, assume it's a new message
    }
  }
  
  // Update last timestamp if newer
  if (isNewMessage) {
    lastMessageTimestamp = message.timestamp;
  }
  
  // Add to global messages array
  chatMessages.unshift(message);
  
  // Keep only last 100 messages
  if (chatMessages.length > 100) {
    chatMessages = chatMessages.slice(0, 100);
  }
  
  // Notify listeners
  if (isNewMessage) {
    notifyMessageListeners([message]);
  }
}

/**
 * Update details of existing messages from the latest DOM scan
 * @param {Array} latestMessages - The latest messages from DOM
 */
export function updateExistingMessageDetails(latestMessages) {
  for (const latestMsg of latestMessages) {
    const existingIndex = chatMessages.findIndex(msg => msg.id === latestMsg.id);
    if (existingIndex >= 0) {
      // Update any fields that might have changed
      chatMessages[existingIndex].isRead = latestMsg.isRead;
      chatMessages[existingIndex].element = latestMsg.element;
    }
  }
}

/**
 * Add a listener for new chat messages
 * @param {Function} callback - The callback function
 * @returns {Function} Function to remove the listener
 */
export function onNewMessages(callback) {
  if (typeof callback !== 'function') return () => {};
  
  userListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    userListeners = userListeners.filter(cb => cb !== callback);
  };
}

/**
 * Notify all listeners about new messages
 * @param {Array} newMessages - Array of new message objects
 */
export function notifyMessageListeners(newMessages) {
  if (newMessages.length === 0) return;
  
  for (const callback of userListeners) {
    try {
      callback(newMessages);
    } catch (error) {
      console.error('[CRM Extension] Error in message listener callback:', error);
    }
  }
}

/**
 * Get all stored chat messages
 * @returns {Array} Array of message objects
 */
export function getAllMessages() {
  return [...chatMessages];
}

/**
 * Get the most recent chat messages
 * @param {number} count - Number of messages to retrieve
 * @returns {Array} Array of message objects
 */
export function getRecentMessages(count = 5) {
  return chatMessages.slice(0, count);
}

/**
 * Get all conversations
 * @returns {Array} Array of conversation objects
 */
export function getAllConversations() {
  return Array.from(conversations.values()).sort((a, b) => {
    // Sort by timestamp (newest first)
    try {
      return new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime();
    } catch (e) {
      return 0;
    }
  });
}

/**
 * Get messages for a specific conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Array} Array of message objects for the conversation
 */
export function getConversationMessages(conversationId) {
  const conversation = conversations.get(conversationId);
  return conversation ? [...conversation.messages].sort((a, b) => {
    // Sort by timestamp (oldest first for display purposes)
    try {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } catch (e) {
      return 0;
    }
  }) : [];
}

/**
 * Mark a conversation as read
 * @param {string} conversationId - The conversation ID
 */
export function markConversationAsRead(conversationId) {
  const conversation = conversations.get(conversationId);
  if (conversation) {
    conversation.unreadCount = 0;
    conversation.messages.forEach(msg => {
      msg.isRead = true;
    });
  }
}

/**
 * Set available channels from external source
 * @param {Array} newChannels - Array of channel objects
 */
export function setChannels(newChannels) {
  channels = newChannels;
}

/**
 * Set available direct messages from external source
 * @param {Array} newDMs - Array of direct message objects
 */
export function setDirectMessages(newDMs) {
  directMessages = newDMs;
}

/**
 * Get all available channels
 * @returns {Array} Array of channel objects
 */
export function getChannels() {
  return [...channels];
}

/**
 * Get all available direct messages
 * @returns {Array} Array of direct message objects
 */
export function getDirectMessages() {
  return [...directMessages];
}

/**
 * Get a specific conversation by ID and type
 * @param {string} id - The conversation ID
 * @param {string} type - The conversation type ('channel' or 'dm')
 * @returns {Object|null} The conversation object or null if not found
 */
export function getConversationById(id, type) {
  if (type === 'channel') {
    return channels.find(channel => channel.id === id);
  } else if (type === 'dm') {
    return directMessages.find(dm => dm.id === id);
  }
  return null;
}

/**
 * Add messages to a specific channel or DM conversation
 * @param {string} id - The conversation ID
 * @param {string} type - The conversation type ('channel' or 'dm')
 * @param {Array} messages - Array of message objects to add
 */
export function addMessagesToConversation(id, type, messages) {
  let conversation = getConversationById(id, type);
  
  if (!conversation) {
    return false;
  }
  
  // Add the messages array if it doesn't exist
  if (!conversation.messages) {
    conversation.messages = [];
  }
  
  // Add messages and update last message information
  if (messages.length > 0) {
    conversation.messages.push(...messages);
    
    // Sort messages by timestamp
    conversation.messages.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    // Update the last message info with the most recent message
    const lastMessage = messages.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })[0];
    
    conversation.lastMessage = lastMessage.text;
    conversation.lastTimestamp = lastMessage.timestamp;
    
    return true;
  }
  
  return false;
}

/**
 * Clean up storage when unloading
 */
export function clearStorage() {
  chatMessages = [];
  conversations.clear();
  userListeners = [];
  lastMessageTimestamp = null;
  channels = [];
  directMessages = [];
}