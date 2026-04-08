const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    age: {
      type: Number,
      min: 10,
      max: 100,
      default: null,
    },
    weight: {
      type: Number,
      min: 20,
      max: 350,
      default: null,
    },
    height: {
      type: Number,
      min: 80,
      max: 250,
      default: null,
    },
    goals: {
      type: [String],
      default: [],
    },
    mode: {
      type: String,
      enum: ['fat-loss', 'muscle-gain', 'maintenance'],
      default: 'maintenance',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
