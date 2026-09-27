const crypto = require("crypto");

/**
 * Generate API key acak yang aman secara kriptografis.
 * 32 byte -> 64 karakter hex, cukup panjang supaya sulit ditebak/brute-force.
 */
function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = generateApiKey;
