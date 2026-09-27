const env = require("../config/env");

const TIER_LIMITS = {
  free: env.RATE_LIMIT_FREE_PER_DAY,
  paid: env.RATE_LIMIT_PAID_PER_DAY,
};

function getLimitForTier(tier) {
  return TIER_LIMITS[tier] ?? TIER_LIMITS.free;
}

/**
 * Middleware Tier Check.
 * Dipasang SETELAH authMiddleware, SEBELUM rateLimitMiddleware.
 *
 * Kenapa urutannya begini (Auth -> Tier -> Rate Limit), padahal
 * diagram "Urutan Middleware (Recap)" di roadmap menulis Rate Limit
 * sebelum Tier Check? Karena Fase 5 eksplisit minta:
 * "Terapkan limit sesuai tier KE rate limit middleware" — artinya
 * rateLimit.middleware.js butuh tahu dulu angka limit yang benar
 * (100/hari untuk free, 10.000/hari untuk paid) SEBELUM dia
 * memutuskan boleh/tidaknya request ini. Middleware ini yang
 * menghitung angka itu dan menitipkannya di req.rateLimitConfig,
 * supaya rateLimit.middleware.js tinggal pakai, tidak perlu tahu
 * apa-apa soal konsep tier.
 */
function tierMiddleware(req, res, next) {
  const tier = req.apiKeyData?.tier || "free";
  req.rateLimitConfig = { tier, limit: getLimitForTier(tier) };
  next();
}

module.exports = { tierMiddleware, getLimitForTier, TIER_LIMITS };
