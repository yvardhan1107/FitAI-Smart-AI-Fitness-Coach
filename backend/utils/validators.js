const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const hasTextValue = (value) => {
  if (value === undefined || value === null) {
    return false;
  }

  return String(value).trim() !== '';
};

const toTrimmedString = (value) => (value === undefined || value === null ? '' : String(value).trim());

const toOptionalNumber = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return Number(value);
};

const inRange = (value, min, max) => typeof value === 'number' && !Number.isNaN(value) && value >= min && value <= max;

module.exports = {
  hasOwn,
  hasTextValue,
  toTrimmedString,
  toOptionalNumber,
  inRange,
};
