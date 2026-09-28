const redis = require("../config/redis");

/**
 * Lua script untuk sliding window log, dieksekusi atomik di sisi Redis
 * (satu round-trip, tidak ada race condition antar request bersamaan).
 *
 * Algoritma:
 * 1. Buang entri yang sudah di luar window (lebih tua dari `now - window`).
 * 2. Hitung berapa entri yang tersisa (= jumlah request dalam window berjalan).
 * 3. Kalau sudah >= limit -> tolak (jangan tambah entri baru).
 * 4. Kalau belum -> tambah entri baru (score = timestamp sekarang,
 *    member = id unik supaya tidak tabrakan antar request di ms yang sama),
 *    lalu set TTL di key supaya otomatis dibersihkan Redis kalau
 *    API key berhenti dipakai (hemat memori).
 *
 * KEYS[1] = rate limit key, contoh: rate:<api_key>
 * ARGV[1] = timestamp sekarang (ms)
 * ARGV[2] = ukuran window (ms)
 * ARGV[3] = limit maksimum request dalam window
 * ARGV[4] = id unik untuk entri kali ini
 */
const SLIDING_WINDOW_SCRIPT = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local member = ARGV[4]

  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
  local count = redis.call('ZCARD', key)

  if count >= limit then
    return { 0, count }
  end

  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, window)

  return { 1, count + 1 }
`;

/**
 * @param {string} key       - key Redis, contoh: rate:<api_key>
 * @param {number} limit     - jumlah maksimum request yang boleh dalam window
 * @param {number} windowMs  - ukuran window dalam milidetik (contoh: 24 jam)
 * @returns {Promise<{ allowed: boolean, count: number }>}
 */
async function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const member = `${now}-${Math.random().toString(36).slice(2)}`;

  const [allowedFlag, count] = await redis.eval(
    SLIDING_WINDOW_SCRIPT,
    1, // jumlah KEYS
    key,
    now,
    windowMs,
    limit,
    member,
  );

  return { allowed: allowedFlag === 1, count };
}

/**
 * "Intip" jumlah request yang sudah tercatat dalam window berjalan,
 * TANPA menambah entri baru (beda dengan checkRateLimit, yang selalu
 * menambah 1 entri setiap dipanggil). Dipakai oleh usage.controller.js
 * (GET /usage) supaya angka "sisa kuota" selalu sinkron dengan sorted
 * set Redis yang sama persis dipakai rateLimit.middleware.js.
 *
 * @param {string} key      - key Redis, contoh: rate:<api_key>
 * @param {number} windowMs - ukuran window dalam milidetik
 * @returns {Promise<number>} jumlah request dalam window berjalan
 */
async function getCurrentUsage(key, windowMs) {
  const now = Date.now();
  await redis.zremrangebyscore(key, 0, now - windowMs);
  return redis.zcard(key);
}

module.exports = { checkRateLimit, getCurrentUsage }; // sebelumnya: module.exports = { checkRateLimit };
