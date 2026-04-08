const logger = require('../utils/logger');

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const logPayload = {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    errorMessage: message,
  };

  if (statusCode >= 500) {
    logger.error('request.error', {
      ...logPayload,
      stack: err.stack,
    });
  } else {
    logger.warn('request.error', logPayload);
  }

  res.status(statusCode).json({
    message,
    requestId: req.requestId,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
