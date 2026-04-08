const User = require('../models/User');

const PROFILE_FIELDS = ['age', 'weight', 'height', 'goals', 'mode'];

const normalizeGoals = (goalsValue) => {
  if (goalsValue === undefined) {
    return undefined;
  }

  if (Array.isArray(goalsValue)) {
    return goalsValue
      .map((goal) => String(goal).trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  if (typeof goalsValue === 'string') {
    return goalsValue
      .split(',')
      .map((goal) => goal.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  return [];
};

const validateProfilePayload = ({ age, weight, height, mode, goals }) => {
  if (age !== undefined && (typeof age !== 'number' || age < 10 || age > 100)) {
    return 'age must be a number between 10 and 100';
  }

  if (weight !== undefined && (typeof weight !== 'number' || weight < 20 || weight > 350)) {
    return 'weight must be a number between 20 and 350';
  }

  if (height !== undefined && (typeof height !== 'number' || height < 80 || height > 250)) {
    return 'height must be a number between 80 and 250';
  }

  if (
    mode !== undefined &&
    !['fat-loss', 'muscle-gain', 'maintenance'].includes(mode)
  ) {
    return 'mode must be one of fat-loss, muscle-gain, maintenance';
  }

  if (goals !== undefined && !Array.isArray(goals)) {
    return 'goals must be an array of strings';
  }

  if (Array.isArray(goals)) {
    if (goals.length > 10) {
      return 'goals must include at most 10 items';
    }

    const invalidGoal = goals.find(
      (goal) => typeof goal !== 'string' || goal.trim().length === 0 || goal.trim().length > 80
    );

    if (invalidGoal !== undefined) {
      return 'each goal must be a non-empty string up to 80 characters';
    }
  }

  return null;
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      profile: {
        age: user.age,
        weight: user.weight,
        height: user.height,
        goals: user.goals || [],
        mode: user.mode || 'maintenance',
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = {};

    for (const field of PROFILE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (updates.goals !== undefined) {
      updates.goals = normalizeGoals(updates.goals);
    }

    if (updates.mode !== undefined && typeof updates.mode === 'string') {
      updates.mode = updates.mode.trim().toLowerCase();
    }

    if (updates.age !== undefined) updates.age = Number(updates.age);
    if (updates.weight !== undefined) updates.weight = Number(updates.weight);
    if (updates.height !== undefined) updates.height = Number(updates.height);

    const validationError = validateProfilePayload(updates);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
      select: '-password',
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: {
        age: user.age,
        weight: user.weight,
        height: user.height,
        goals: user.goals || [],
        mode: user.mode || 'maintenance',
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
