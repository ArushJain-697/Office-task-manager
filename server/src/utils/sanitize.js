const sanitizeHtml = require("sanitize-html");

const sanitize = (value) => {
  if (typeof value !== "string") return value;
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

const sanitizeObject = (obj) => {
  const result = {};
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "string") {
      result[key] = sanitize(val);
    } else if (Array.isArray(val)) {
      result[key] = val.map((v) => (typeof v === "string" ? sanitize(v) : v));
    } else {
      result[key] = val;
    }
  }
  return result;
};

module.exports = { sanitize, sanitizeObject };