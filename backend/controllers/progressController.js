const mongoose = require('mongoose');
const ProgressLog = require('../models/ProgressLog');
const { calculateStreakStats } = require('../utils/progressMetrics');
const { hasOwn, hasTextValue, toOptionalNumber, inRange } = require('../utils/validators');

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const parseOptionalBoolean = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === '') return undefined;
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }

  return undefined;
};

const normalizeUpdatePayload = (body) => {
  const updates = {};

  const workoutDone = parseOptionalBoolean(body.workoutDone);
  if (workoutDone !== undefined) {
    updates.workoutDone = workoutDone;
  }

  if (hasTextValue(body.workoutType)) {
    updates.workoutType = String(body.workoutType).trim();
  }

  const burnedCalories = toOptionalNumber(body.burnedCalories);
  if (burnedCalories !== undefined) {
    updates.burnedCalories = burnedCalories;
  }

  const sleepHours = toOptionalNumber(body.sleepHours);
  if (sleepHours !== undefined) {
    updates.sleepHours = sleepHours;
  }

  const waterLiters = toOptionalNumber(body.waterLiters);
  if (waterLiters !== undefined) {
    updates.waterLiters = waterLiters;
  }

  if (hasTextValue(body.mood)) {
    updates.mood = String(body.mood).trim().toLowerCase();
  }

  if (hasTextValue(body.notes)) {
    updates.notes = String(body.notes).trim();
  }

  return updates;
};

const validateProgressPayload = (body, updates) => {
  if (hasOwn(body, 'workoutDone') && parseOptionalBoolean(body.workoutDone) === undefined) {
    return 'workoutDone must be true or false';
  }

  if (hasOwn(body, 'workoutType') && hasTextValue(body.workoutType)) {
    const workoutType = String(body.workoutType).trim();
    if (workoutType.length > 80) {
      return 'workoutType must be 80 characters or less';
    }
  }

  if (updates.burnedCalories !== undefined && !inRange(updates.burnedCalories, 0, 5000)) {
    return 'burnedCalories must be a number between 0 and 5000';
  }

  if (updates.sleepHours !== undefined && !inRange(updates.sleepHours, 0, 15)) {
    return 'sleepHours must be a number between 0 and 15';
  }

  if (updates.waterLiters !== undefined && !inRange(updates.waterLiters, 0, 30)) {
    return 'waterLiters must be a number between 0 and 30';
  }

  if (hasOwn(body, 'mood') && hasTextValue(body.mood)) {
    const mood = String(body.mood).trim().toLowerCase();
    if (!['low', 'normal', 'high'].includes(mood)) {
      return 'mood must be one of low, normal, or high';
    }
  }

  if (hasOwn(body, 'notes') && hasTextValue(body.notes)) {
    const notes = String(body.notes).trim();
    if (notes.length > 500) {
      return 'notes must be 500 characters or less';
    }
  }

  return null;
};

const postTodayProgress = async (req, res, next) => {
  try {
    const updates = normalizeUpdatePayload(req.body);
    const validationError = validateProgressPayload(req.body, updates);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { start, end } = getTodayRange();

    let progressLog = await ProgressLog.findOne({
      user: req.userId,
      loggedDate: { $gte: start, $lte: end },
    });

    if (!progressLog) {
      progressLog = await ProgressLog.create({
        user: req.userId,
        loggedDate: new Date(),
        ...updates,
      });

      return res.status(201).json({
        message: 'Today progress created',
        progress: progressLog,
      });
    }

    Object.assign(progressLog, updates);
    await progressLog.save();

    return res.status(200).json({
      message: 'Today progress updated',
      progress: progressLog,
    });
  } catch (error) {
    return next(error);
  }
};

const getRecentProgress = async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit);
    const limit = Number.isNaN(parsedLimit)
      ? 14
      : Math.min(Math.max(parsedLimit, 1), 60);

    const progressLogs = await ProgressLog.find({ user: req.userId })
      .sort({ loggedDate: -1 })
      .limit(limit);

    return res.status(200).json({
      count: progressLogs.length,
      progress: progressLogs,
    });
  } catch (error) {
    return next(error);
  }
};

const getStreak = async (req, res, next) => {
  try {
    const workoutLogs = await ProgressLog.find({
      user: req.userId,
      workoutDone: true,
    })
      .select('loggedDate')
      .sort({ loggedDate: 1 });

    const stats = calculateStreakStats(workoutLogs.map((log) => log.loggedDate));

    const habitLogs = await ProgressLog.find({
      user: req.userId,
    }).select('loggedDate workoutDone sleepHours waterLiters');

    const calculateHabitStreak = (predicate) => {
      const matchedLogs = habitLogs
        .filter((log) => predicate(log))
        .map((log) => log.loggedDate);

      return calculateStreakStats(matchedLogs).currentStreak;
    };

    const habitStreaks = {
      sleep: calculateHabitStreak((log) => typeof log.sleepHours === 'number' && log.sleepHours >= 7),
      hydration: calculateHabitStreak((log) => typeof log.waterLiters === 'number' && log.waterLiters >= 2),
      activeDays: calculateHabitStreak((log) => log.workoutDone === true),
    };

    return res.status(200).json({
      ...stats,
      habitStreaks,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteProgress = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid progress id' });
    }

    const deletedLog = await ProgressLog.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!deletedLog) {
      return res.status(404).json({ message: 'Progress log not found' });
    }

    return res.status(200).json({ message: 'Progress log deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  postTodayProgress,
  getRecentProgress,
  getStreak,
  deleteProgress,
};
