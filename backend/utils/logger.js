const getLogLevelWeight = (level) => {
  const levels = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
  };

  return levels[level] || levels.info;
};

const activeLevel = process.env.LOG_LEVEL || 'info';

const writeLog = (level, message, meta = {}) => {
  if (getLogLevelWeight(level) < getLogLevelWeight(activeLevel)) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const serialized = JSON.stringify(entry);

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  if (level === 'warn') {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
};

module.exports = {
  debug: (message, meta) => writeLog('debug', message, meta),
  info: (message, meta) => writeLog('info', message, meta),
  warn: (message, meta) => writeLog('warn', message, meta),
  error: (message, meta) => writeLog('error', message, meta),
};
