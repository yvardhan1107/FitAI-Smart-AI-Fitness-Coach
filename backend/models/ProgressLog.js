const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema(
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
    workoutDone: {
      type: Boolean,
      default: false,
    },
    workoutType: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    burnedCalories: {
      type: Number,
      min: 0,
      max: 5000,
      default: null,
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 15,
      default: null,
    },
    waterLiters: {
      type: Number,
      min: 0,
      max: 30,
      default: null,
    },
    mood: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
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

progressLogSchema.index({ user: 1, loggedDate: 1 }, { unique: true });

module.exports = mongoose.model('ProgressLog', progressLogSchema);
