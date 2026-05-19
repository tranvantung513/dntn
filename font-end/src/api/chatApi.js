import axios from '../utils/axiosConfig';

export const chatApi = {
  /**
   * Send a message to the AI Chatbot
   * @param {string} message - User's message
   * @param {string} sessionId - User's unique session ID
   */
  sendMessage: async (message, sessionId) => {
    return await axios.post('/api/chat', {
      message,
      sessionId
    });
  }
};
