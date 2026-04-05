const ChatHistory = require("../models/ChatHistory");
const { generateResponse } = require("../services/chat/aiService");
const { buildHealthContext } = require("../services/chat/aiEngine");
const {
  getMLPredictions,
  generateProjections,
} = require("../services/chat/mlService");
const { normalizeChatProfile } = require("../services/chat/profileService");

const FALLBACKS = {
  headache:
    "Headaches can be caused by dehydration, stress, or lack of sleep. Drink plenty of water, rest in a quiet dark room, and take a mild painkiller if needed. See a doctor if it persists more than 2 days.",
  fever:
    "For fever, rest well and stay hydrated. Take paracetamol to reduce temperature. See a doctor if fever is above 103°F or lasts more than 3 days.",
  diet: "A balanced diet includes fruits, vegetables, whole grains, lean protein and plenty of water. Avoid processed foods and excess sugar.",
  sleep:
    "For better sleep, maintain a fixed sleep schedule, avoid screens 1 hour before bed, and keep your room cool and dark.",
  default:
    "I'm your HealthAI assistant! I can help with symptoms, diet advice, and general health questions. Please ask me anything health related.",
};

const getFallback = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes("headache") || msg.includes("head"))
    return FALLBACKS.headache;
  if (msg.includes("fever") || msg.includes("temperature"))
    return FALLBACKS.fever;
  if (msg.includes("diet") || msg.includes("food") || msg.includes("eat"))
    return FALLBACKS.diet;
  if (msg.includes("sleep") || msg.includes("insomnia")) return FALLBACKS.sleep;
  return FALLBACKS.default;
};

const buildFallbackInsights = (profile, context) => {
  return {
    predicted_weight: Number(profile.weight),
    obesity_risk: context.bmiData.category,
    health_score: Number(context.healthScore.score),
  };
};

// POST /api/chat
const sendMessage = async (req, res) => {
  try {
    const { message, userProfile, isFirstMessage } = req.body;
    if (!message)
      return res.status(400).json({ message: "Message is required" });

    let chat = await ChatHistory.findOne({ user: req.user._id });
    if (!chat) {
      chat = await ChatHistory.create({ user: req.user._id, messages: [] });
    }

    chat.messages.push({ role: "user", content: message, time: new Date() });

    let aiResponse;
    let source = "gemini";
    const normalizedProfile = normalizeChatProfile(req.user, userProfile);

    try {
      const response = await generateResponse({
        message,
        userProfile: normalizedProfile,
        isFirstMessage: Boolean(isFirstMessage),
        history: chat.messages,
      });
      aiResponse = response.text;
      console.log("✅ Gemini responded successfully");
    } catch (err) {
      console.log("⚠️ Gemini failed:", err.message);
      aiResponse = getFallback(message);
      source = "fallback";
    }

    chat.messages.push({
      role: "assistant",
      content: aiResponse,
      time: new Date(),
    });

    if (chat.messages.length > 50) {
      chat.messages = chat.messages.slice(-50);
    }

    await chat.save();
    console.log(`✅ Chat response sent via ${source}`);

    res.json({ message: aiResponse, source, timestamp: new Date() });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/chat/history
const getChatHistory = async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({ user: req.user._id });
    const messages = chat ? chat.messages.slice(-30) : [];
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/chat/insights
const getChatInsights = async (req, res) => {
  try {
    const normalizedProfile = normalizeChatProfile(
      req.user,
      req.body.userProfile,
    );
    const context = await buildHealthContext(
      normalizedProfile,
      req.body.message || "",
    );

    let predictions;
    let source = "graph-ml";

    try {
      predictions = await getMLPredictions(normalizedProfile);
    } catch (error) {
      console.log("⚠️ Graph ML fallback:", error.message);
      predictions = buildFallbackInsights(normalizedProfile, context);
      source = "fallback";
    }

    const projections = generateProjections(normalizedProfile, predictions);

    res.json({
      profile: normalizedProfile,
      predictions,
      projections,
      context,
      source,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getChatHistory, getChatInsights };
