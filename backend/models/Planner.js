const mongoose = require('mongoose');

const plannerExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    sets: {
      type: Number,
      min: 0,
      default: null,
    },
    reps: {
      type: String,
      trim: true,
      default: '',
    },
    durationMinutes: {
      type: Number,
      min: 0,
      default: null,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const plannerDaySchema = new mongoose.Schema(
  {
    dayIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    dayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    focus: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    estimatedMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
    exercises: {
      type: [plannerExerciseSchema],
      default: [],
    },
  },
  { _id: false }
);

const plannerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekStart: {
      type: Date,
      required: true,
      index: true,
    },
    days: {
      type: [plannerDaySchema],
      default: [],
    },
    generationMeta: {
      mode: {
        type: String,
        trim: true,
        default: 'maintenance',
      },
      goals: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

plannerSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('Planner', plannerSchema);
