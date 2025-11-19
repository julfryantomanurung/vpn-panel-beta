const { v4: uuidv4 } = require('uuid');

/**
 * Generate a UUID for VPN users
 * @returns {string} UUID v4 string
 */
function generateUUID() {
  return uuidv4();
}

module.exports = {
  generateUUID,
};
