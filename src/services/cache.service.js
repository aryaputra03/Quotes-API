const redis = require("../config/redis");

/**
 * Ambil data cache dari Redis. Return null kalau tidak ada / expired
 * (Redis otomatis hapus key yang TTL-nya habis).
 * @param {string} key
 * @returns {Promise<any|null>}
 */
async function getCache(key) {
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Simpan data ke Redis dengan TTL (dalam detik).
 * @param {string} key
 * @param {any} value - akan di-JSON.stringify
 * @param {number} ttlSeconds
 */
async function setCache(key, value, ttlSeconds) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

module.exports = { getCache, setCache };
