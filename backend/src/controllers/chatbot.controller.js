const chatbotService = require('../services/chatbot.service');
const SearchHistory = require('../models/SearchHistory');

/**
 * POST /api/chatbot/query
 * Process a conversational query and return an AI response along with products.
 */
const queryChatbot = async (req, res, next) => {
  try {
    const { message, session_id } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const sessionId = session_id || require('crypto').randomUUID();

    // Log the user's message as a search intent (analytics)
    if (req.user) {
      SearchHistory.create({
        buyer_id: req.user.id,
        query: message,
      }).catch(err => console.error('Failed to log chatbot search history:', err));
    }

    const result = await chatbotService.handleQuery(sessionId, message);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/chatbot/session/:id
 * Clears the conversation memory for a given session
 */
const clearSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    await chatbotService.clearSession(id);
    res.json({ success: true, message: 'Session cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  queryChatbot,
  clearSession,
};
