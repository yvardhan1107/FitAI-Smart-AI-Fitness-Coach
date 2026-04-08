let rateLimit;
let helmet;

try {
  rateLimit = require('express-rate-limit');
} catch (error) {
  rateLimit = null;
}

try {
  helmet = require('helmet');
} catch (error) {
  helmet = null;
}

const passthroughMiddleware = (req, res, next) => next();

const parseAllowedOrigins = () => {
  const raw = process.env.ALLOWED_ORIGINS || '';

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const createCorsOptions = () => {
  const allowedOrigins = parseAllowedOrigins();

  if (allowedOrigins.length === 0) {
    return {
      origin: true,
      credentials: true,
    };
  }

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS policy'));
    },
    credentials: true,
  };
};

const createApiRateLimiter = () => {
  if (!rateLimit) {
    return passthroughMiddleware;
  }

  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 200;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many requests. Please try again later.',
    },
  });
};

const createAuthRateLimiter = () => {
  if (!rateLimit) {
    return passthroughMiddleware;
  }

  const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000;
  const max = Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 30;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many authentication attempts. Please wait and retry.',
    },
  });
};

const securityHeaders = helmet
  ? helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  : passthroughMiddleware;

module.exports = {
  createCorsOptions,
  createApiRateLimiter,
  createAuthRateLimiter,
  securityHeaders,
};
