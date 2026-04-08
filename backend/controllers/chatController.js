const ChatLog = require('../models/ChatLog');
const User = require('../models/User');
const { generateCoachReply } = require('../services/chatService');

const sendChatMessage = async (req, res, next) => {
  try {
    const rawMessage = req.body?.message;
    const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';

    if (!message) {
      return res.status(400).json({ message: 'message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: 'message must be 1000 characters or less' });
    }

    const userProfile = await User.findById(req.userId).select('mode goals');

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEntry = await ChatLog.create({
      user: req.userId,
      role: 'user',
      message,
    });

    const assistantMessage = generateCoachReply({
      message,
      userProfile,
    });

    const assistantEntry = await ChatLog.create({
      user: req.userId,
      role: 'assistant',
      message: assistantMessage,
    });

    return res.status(201).json({
      message: 'Chat message sent successfully',
      messages: [userEntry, assistantEntry],
    });
  } catch (error) {
    return next(error);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit);
    const limit = Number.isNaN(parsedLimit) ? 50 : Math.min(Math.max(parsedLimit, 1), 200);

    const messagesDesc = await ChatLog.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    const messages = [...messagesDesc].reverse();

    return res.status(200).json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    return next(error);
  }
};

const clearChatHistory = async (req, res, next) => {
  try {
    const result = await ChatLog.deleteMany({ user: req.userId });

    return res.status(200).json({
      message: 'Chat history cleared successfully',
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
};
