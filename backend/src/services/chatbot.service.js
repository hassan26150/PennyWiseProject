const Redis = require('ioredis');
const { z } = require('zod');
const env = require('../config/env');
const logger = require('../utils/logger');
const GroqProvider = require('./ai/groq.provider');
const MasterProduct = require('../models/MasterProduct');
const Product = require('../models/Product');

// Initialize Memory cache (Redis with In-Memory fallback)
let redisClient = null;
const memoryCache = new Map();

if (env.REDIS_URL) {
  redisClient = new Redis(env.REDIS_URL);
  redisClient.on('error', (err) => logger.error('Redis Connection Error:', err));
}

const getSession = async (sessionId) => {
  if (redisClient) {
    const data = await redisClient.get(`chatbot:${sessionId}`);
    return data ? JSON.parse(data) : [];
  }
  return memoryCache.get(sessionId) || [];
};

const saveSession = async (sessionId, messages) => {
  // Keep last 10 messages (5 turns)
  const recentMessages = messages.slice(-10);
  if (redisClient) {
    await redisClient.set(`chatbot:${sessionId}`, JSON.stringify(recentMessages), 'EX', 86400); // 24 hours
  } else {
    memoryCache.set(sessionId, recentMessages);
  }
};

const clearSessionMemory = async (sessionId) => {
  if (redisClient) {
    await redisClient.del(`chatbot:${sessionId}`);
  } else {
    memoryCache.delete(sessionId);
  }
};

// Define Output Schema
const responseSchema = z.object({
  response: z.string(),
  filters: z.object({
    category: z.string().nullable().optional(),
    max_price: z.number().nullable().optional(),
    min_price: z.number().nullable().optional(),
    brand: z.string().nullable().optional(),
    keywords: z.array(z.string()).default([])
  }).optional()
});

const SYSTEM_PROMPT = `You are PennyWise AI, a shopping assistant for a Pakistani e-commerce platform.
Your job is to understand shopping intent, extract structured filters, and help users find products.
All prices are in PKR (Pakistani Rupees).
"1k" means 1000. "100k" means 100000. "1 lac" means 100000.

You MUST respond in valid JSON format ONLY. 
Do NOT include any markdown formatting like \`\`\`json.
Your JSON must strictly match this structure:
{
  "response": "A conversational response to the user. E.g., 'Here are some Samsung phones under 100k...'",
  "filters": {
    "category": null,
    "max_price": null,
    "min_price": null,
    "brand": null,
    "keywords": ["keyword1", "keyword2"]
  }
}
If the user isn't searching for a product, leave filters empty/null, but still provide a natural "response".`;

class ChatbotService {
  constructor() {
    this.aiProvider = new GroqProvider();
  }

  async handleQuery(sessionId, message) {
    // 1. Fetch memory
    const history = await getSession(sessionId);
    
    // 2. Build AI payload
    const newMessages = [...history, { role: 'user', content: message }];
    
    // 3. Get AI Intent & Response
    let parsed;
    try {
      const rawResponse = await this.aiProvider.generateResponse(newMessages, SYSTEM_PROMPT, true);
      // Groq might occasionally wrap in markdown despite prompt
      const jsonStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(jsonStr);
      parsed = responseSchema.parse(parsed);
    } catch (e) {
      logger.error('Failed to parse AI output:', e);
      parsed = {
        response: "I'm having trouble processing that right now. Could you rephrase your request?",
        filters: {}
      };
    }

    // 4. Update memory
    newMessages.push({ role: 'assistant', content: parsed.response });
    await saveSession(sessionId, newMessages);

    // 5. Query Products using extracted filters
    let products = [];
    if (parsed.filters) {
      products = await this.searchProducts(parsed.filters);
    }

    return {
      response: parsed.response,
      products,
      session_id: sessionId
    };
  }

  async searchProducts(filters) {
    const keywords = filters.keywords || [];

    // Combine category and brand into keywords for the text index search
    if (filters.category) keywords.push(filters.category);
    if (filters.brand) keywords.push(filters.brand);

    const searchStr = keywords.filter(Boolean).join(' ');

    // ── Search MasterProducts (External/Discovery catalog) ──
    const masterQuery = { is_active: true };
    if (filters.min_price || filters.max_price) {
      masterQuery.lowest_market_price = {};
      if (filters.min_price) masterQuery.lowest_market_price.$gte = filters.min_price;
      if (filters.max_price) masterQuery.lowest_market_price.$lte = filters.max_price;
    }

    let masterResults = [];
    if (searchStr.trim()) {
      masterQuery.$text = { $search: searchStr };
      masterResults = await MasterProduct.find(masterQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(6)
        .populate('category_id', 'name slug');
    } else if (filters.min_price || filters.max_price) {
      masterResults = await MasterProduct.find(masterQuery)
        .sort({ total_views: -1 })
        .limit(6)
        .populate('category_id', 'name slug');
    }

    // ── Search native PennyWise Products (seller listings) ──
    const nativeQuery = { status: 'approved' };
    if (filters.min_price || filters.max_price) {
      nativeQuery.price = {};
      if (filters.min_price) nativeQuery.price.$gte = filters.min_price;
      if (filters.max_price) nativeQuery.price.$lte = filters.max_price;
    }

    let nativeResults = [];
    if (searchStr.trim()) {
      nativeQuery.$text = { $search: searchStr };
      nativeResults = await Product.find(nativeQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(6)
        .populate('category_id', 'name slug')
        .populate('seller_id', 'store_name');
    } else if (filters.min_price || filters.max_price) {
      nativeResults = await Product.find(nativeQuery)
        .sort({ total_views: -1 })
        .limit(6)
        .populate('category_id', 'name slug')
        .populate('seller_id', 'store_name');
    }

    // Tag results with source for the frontend
    const taggedMaster = masterResults.map(p => {
      const obj = p.toObject();
      obj.source = 'external';
      return obj;
    });
    const taggedNative = nativeResults.map(p => {
      const obj = p.toObject();
      obj.source = 'pennywise';
      return obj;
    });

    // Merge: native first (they can be purchased), then external
    return [...taggedNative, ...taggedMaster].slice(0, 10);
  }

  async clearSession(sessionId) {
    await clearSessionMemory(sessionId);
  }
}

module.exports = new ChatbotService();

