let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (error) {
  bcrypt = require('bcrypt');
}
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { toTrimmedString } = require('../utils/validators');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildAuthResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  weight: user.weight,
  height: user.height,
  goals: user.goals || [],
  mode: user.mode || 'maintenance',
});

const createToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedName = toTrimmedString(name);
    const normalizedEmail = toTrimmedString(email).toLowerCase();
    const normalizedPassword = typeof password === 'string' ? password : '';

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return res.status(400).json({
        message: 'name, email, and password are required',
      });
    }

    if (normalizedName.length < 2 || normalizedName.length > 60) {
      return res.status(400).json({
        message: 'name must be between 2 and 60 characters',
      });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'email is not valid',
      });
    }

    if (normalizedPassword.length < 6 || normalizedPassword.length > 128) {
      return res.status(400).json({
        message: 'password must be between 6 and 128 characters',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = createToken(user._id.toString());

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: buildAuthResponse(user),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = toTrimmedString(email).toLowerCase();
    const normalizedPassword = typeof password === 'string' ? password : '';

    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({
        message: 'email and password are required',
      });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'email is not valid',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const passwordMatches = await bcrypt.compare(normalizedPassword, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = createToken(user._id.toString());

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: buildAuthResponse(user),
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      user: buildAuthResponse(user),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
