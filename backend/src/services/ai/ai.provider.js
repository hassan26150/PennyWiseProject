/**
 * AI Provider Base Interface
 * Defins the standard contract for any AI integration (Groq, OpenAI, Gemini).
 */
class AIProvider {
  /**
   * Initialize the provider with required credentials
   */
  constructor() {
    if (this.constructor === AIProvider) {
      throw new Error("Cannot instantiate abstract class AIProvider");
    }
  }

  /**
   * Generate a response based on the message history.
   * 
   * @param {Array<{role: string, content: string}>} messages - The conversation history
   * @param {string} systemPrompt - The instruction for the AI model
   * @param {boolean} jsonMode - Whether to force the output to be JSON
   * @returns {Promise<string>} The raw AI response text
   */
  async generateResponse(messages, systemPrompt, jsonMode = false) {
    throw new Error("Method 'generateResponse()' must be implemented.");
  }
}

module.exports = AIProvider;
