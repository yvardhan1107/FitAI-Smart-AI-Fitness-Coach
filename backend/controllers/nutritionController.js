const MealLog = require('../models/MealLog');
const { hasOwn, hasTextValue, toOptionalNumber, inRange } = require('../utils/validators');

const ALLOWED_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'mixed'];

const getStartOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getTodayRange = () => {
  const now = new Date();
  const start = getStartOfDay(now);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const normalizeNutritionPayload = (body) => {
  const updates = {};

  if (hasTextValue(body.mealType)) {
    updates.mealType = String(body.mealType).trim().toLowerCase();
  }

  const calories = toOptionalNumber(body.calories);
  if (calories !== undefined) {
    updates.calories = calories;
  }

  const protein = toOptionalNumber(body.protein);
  if (protein !== undefined) {
    updates.protein = protein;
  }

  const carbs = toOptionalNumber(body.carbs);
  if (carbs !== undefined) {
    updates.carbs = carbs;
  }

  const fats = toOptionalNumber(body.fats);
  if (fats !== undefined) {
    updates.fats = fats;
  }

  if (hasTextValue(body.notes)) {
    updates.notes = String(body.notes).trim();
  }

  return updates;
};

const validateNutritionPayload = (body, updates) => {
  if (hasOwn(body, 'mealType') && hasTextValue(body.mealType)) {
    if (!ALLOWED_MEAL_TYPES.includes(updates.mealType)) {
      return 'mealType must be one of breakfast, lunch, dinner, snack, or mixed';
    }
  }

  if (updates.calories !== undefined && !inRange(updates.calories, 0, 10000)) {
    return 'calories must be between 0 and 10000';
  }

  if (updates.protein !== undefined && !inRange(updates.protein, 0, 1000)) {
    return 'protein must be between 0 and 1000';
  }

  if (updates.carbs !== undefined && !inRange(updates.carbs, 0, 1500)) {
    return 'carbs must be between 0 and 1500';
  }

  if (updates.fats !== undefined && !inRange(updates.fats, 0, 1000)) {
    return 'fats must be between 0 and 1000';
  }

  if (hasOwn(body, 'notes') && hasTextValue(body.notes)) {
    const notes = String(body.notes).trim();
    if (notes.length > 500) {
      return 'notes must be 500 characters or less';
    }
  }

  return null;
};

const postTodayNutrition = async (req, res, next) => {
  try {
    const updates = normalizeNutritionPayload(req.body);
    const validationError = validateNutritionPayload(req.body, updates);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { start, end } = getTodayRange();

    let mealLog = await MealLog.findOne({
      user: req.userId,
      loggedDate: { $gte: start, $lte: end },
    });

    if (!mealLog) {
      mealLog = await MealLog.create({
        user: req.userId,
        // Persist one canonical timestamp per day to avoid same-day overlap.
        loggedDate: getStartOfDay(),
        ...updates,
      });

      return res.status(201).json({
        message: 'Today nutrition created',
        nutrition: mealLog,
      });
    }

    if (updates.calories !== undefined) {
      mealLog.calories = (mealLog.calories || 0) + updates.calories;
    }

    if (updates.protein !== undefined) {
      mealLog.protein = (mealLog.protein || 0) + updates.protein;
    }

    if (updates.carbs !== undefined) {
      mealLog.carbs = (mealLog.carbs || 0) + updates.carbs;
    }

    if (updates.fats !== undefined) {
      mealLog.fats = (mealLog.fats || 0) + updates.fats;
    }

    if (updates.mealType) {
      mealLog.mealType = mealLog.mealType && mealLog.mealType !== updates.mealType
        ? 'mixed'
        : updates.mealType;
    }

    if (updates.notes) {
      const combinedNotes = mealLog.notes
        ? `${mealLog.notes}\n${updates.notes}`
        : updates.notes;

      if (combinedNotes.length > 500) {
        return res.status(400).json({ message: 'combined notes must be 500 characters or less' });
      }

      mealLog.notes = combinedNotes;
    }

    await mealLog.save();

    return res.status(200).json({
      message: 'Today nutrition added to daily total',
      nutrition: mealLog,
    });
  } catch (error) {
    return next(error);
  }
};

const getRecentNutrition = async (req, res, next) => {
  try {
    const parsedLimit = Number(req.query.limit);
    const limit = Number.isNaN(parsedLimit) ? 30 : Math.min(Math.max(parsedLimit, 1), 90);

    const nutritionLogs = await MealLog.find({ user: req.userId })
      .sort({ loggedDate: -1 })
      .limit(limit);

    return res.status(200).json({
      count: nutritionLogs.length,
      nutrition: nutritionLogs,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  postTodayNutrition,
  getRecentNutrition,
};
