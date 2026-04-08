const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  postTodayProgress,
  getRecentProgress,
  getStreak,
  deleteProgress,
} = require('../controllers/progressController');

const router = express.Router();

router.post('/', authMiddleware, postTodayProgress);
router.get('/', authMiddleware, getRecentProgress);
router.get('/streak', authMiddleware, getStreak);
router.delete('/:id', authMiddleware, deleteProgress);

module.exports = router;
