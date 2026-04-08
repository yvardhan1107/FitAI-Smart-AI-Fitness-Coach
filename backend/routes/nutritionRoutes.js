const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { postTodayNutrition, getRecentNutrition } = require('../controllers/nutritionController');

const router = express.Router();

router.post('/', authMiddleware, postTodayNutrition);
router.get('/', authMiddleware, getRecentNutrition);

module.exports = router;
