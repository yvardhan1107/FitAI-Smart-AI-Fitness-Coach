const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { generateWeeklyPlan, getTodayWorkout } = require('../controllers/plannerController');

const router = express.Router();

router.post('/generate-weekly', authMiddleware, generateWeeklyPlan);
router.get('/today', authMiddleware, getTodayWorkout);

module.exports = router;
