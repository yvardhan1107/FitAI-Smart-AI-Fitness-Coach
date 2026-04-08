const Planner = require('../models/Planner');
const User = require('../models/User');
const { FALLBACK_IMAGE_URL, buildWeekPlanDays } = require('../services/plannerService');

const getWeekStart = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);

  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);

  return date;
};

const formatPlannerResponse = (planner) => ({
  id: planner._id,
  user: planner.user,
  weekStart: planner.weekStart,
  days: planner.days,
  generationMeta: planner.generationMeta,
  fallbackImageUrl: FALLBACK_IMAGE_URL,
  createdAt: planner.createdAt,
  updatedAt: planner.updatedAt,
});

const generateWeeklyPlan = async (req, res, next) => {
  try {
    const weekStart = getWeekStart();

    const existingPlan = await Planner.findOne({
      user: req.userId,
      weekStart,
    });

    if (existingPlan) {
      return res.status(200).json({
        message: 'Weekly plan already exists for this week',
        plan: formatPlannerResponse(existingPlan),
      });
    }

    const user = await User.findById(req.userId).select('mode goals');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mode = user.mode || 'maintenance';
    const goals = Array.isArray(user.goals) ? user.goals : [];

    const plan = await Planner.create({
      user: req.userId,
      weekStart,
      days: buildWeekPlanDays(mode),
      generationMeta: {
        mode,
        goals,
      },
    });

    return res.status(201).json({
      message: 'Weekly plan generated successfully',
      plan: formatPlannerResponse(plan),
    });
  } catch (error) {
    return next(error);
  }
};

const getTodayWorkout = async (req, res, next) => {
  try {
    const now = new Date();
    const weekStart = getWeekStart(now);

    const plan = await Planner.findOne({
      user: req.userId,
      weekStart,
    });

    if (!plan) {
      return res.status(404).json({
        message: 'No weekly plan found. Generate your weekly plan first.',
      });
    }

    const todayDayIndex = now.getDay();
    const todayWorkout = plan.days.find((day) => day.dayIndex === todayDayIndex);

    if (!todayWorkout) {
      return res.status(404).json({ message: 'Today workout not found in the current weekly plan' });
    }

    return res.status(200).json({
      date: now.toISOString(),
      weekStart: plan.weekStart,
      today: todayWorkout,
      fallbackImageUrl: FALLBACK_IMAGE_URL,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateWeeklyPlan,
  getTodayWorkout,
};
