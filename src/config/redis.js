const Redis = require("ioredis");
const env = require("./env");

/**
 * Redis client singleton.
 * Dipakai untuk:
 * - Sliding window rate limiting (sorted set, key: rate:{api_key})  -> Fase 4
 * - HTTP response caching (key-value + TTL)                        -> Fase 6
 */
const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("[redis] Connected to Redis");
});

redis.on("error", (err) => {
  console.error("[redis] Connection error:", err.message);
});

module.exports = redis;
