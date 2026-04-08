const mongoose = require('mongoose');

const mealLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    loggedDate: {
      type: Date,
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'mixed'],
      default: 'mixed',
    },
    calories: {
      type: Number,
      min: 0,
      max: 10000,
      default: null,
    },
    protein: {
      type: Number,
      min: 0,
      max: 1000,
      default: null,
    },
    carbs: {
      type: Number,
      min: 0,
      max: 1500,
      default: null,
    },
    fats: {
      type: Number,
      min: 0,
      max: 1000,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

mealLogSchema.index({ user: 1, loggedDate: 1 }, { unique: true });

module.exports = mongoose.model('MealLog', mealLogSchema);
