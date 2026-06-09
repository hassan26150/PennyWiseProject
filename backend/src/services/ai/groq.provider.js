const Groq = require('groq-sdk');
const AIProvider = require('./ai.provider');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class GroqProvider extends AIProvider {
  constructor() {
    super();
    if (!env.GROQ_API_KEY) {
      logger.warn('GROQ_API_KEY is not configured! AI features will fail.');
    }
    this.client = new Groq({
      apiKey: env.GROQ_API_KEY,
    });
    // Use the latest supported Llama model
    this.model = 'llama-3.3-70b-versatile'; 
  }

  async generateResponse(messages, systemPrompt, jsonMode = false) {
    try {
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const options = {
        messages: formattedMessages,
        model: this.model,
        temperature: 0.1, // Low temperature for consistent JSON
      };

      if (jsonMode) {
        options.response_format = { type: 'json_object' };
      }

      const completion = await this.client.chat.completions.create(options);
      return completion.choices[0]?.message?.content || '{}';
    } catch (error) {
      logger.error('GroqProvider Error:', error);
      throw error;
    }
  }
}

module.exports = GroqProvider;
