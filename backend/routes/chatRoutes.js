const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { sendChatMessage, getChatHistory, clearChatHistory } = require('../controllers/chatController');

const router = express.Router();

router.post('/send', authMiddleware, sendChatMessage);
router.get('/history', authMiddleware, getChatHistory);
router.delete('/clear', authMiddleware, clearChatHistory);

module.exports = router;
