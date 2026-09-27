const { checkRateLimit } = require("../services/rateLimiter.service");
const env = require("../config/env");

// Window harian (24 jam) — selaras dengan RATE_LIMIT_FREE_PER_DAY /
// RATE_LIMIT_PAID_PER_DAY di .env yang sudah disiapkan sejak Fase 0.
const WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Middleware rate limiting berbasis sliding window log (Redis sorted set).
 * Wajib dipasang SETELAH authMiddleware, karena butuh req.apiKeyData.
 *
 * Catatan: di Fase 4 ini limit masih SAMA untuk semua API key
 * (pakai RATE_LIMIT_FREE_PER_DAY sebagai default). Pembedaan limit
 * per tier (free vs paid) baru dipasang di Fase 5 — nanti baris
 * `const limit = ...` di bawah ini tinggal diganti supaya membaca
 * dari req.apiKeyData.tier.
 */
/**
 * Middleware rate limiting berbasis sliding window log (Redis sorted set).
 * Wajib dipasang SETELAH authMiddleware DAN tierMiddleware, karena
 * butuh req.apiKeyData (identitas) dan req.rateLimitConfig.limit
 * (angka limit yang sudah disesuaikan tier oleh tier.middleware.js).
 */
async function rateLimitMiddleware(req, res, next) {
  try {
    const { api_key: apiKey } = req.apiKeyData;
    const rateKey = `rate:${apiKey}`;
    // Fallback ke RATE_LIMIT_FREE_PER_DAY kalau entah kenapa tierMiddleware
    // belum dipasang di depan middleware ini — supaya tidak crash,
    // walau seharusnya req.rateLimitConfig selalu ada di alur normal.
    const limit = req.rateLimitConfig?.limit ?? env.RATE_LIMIT_FREE_PER_DAY;

    const { allowed, count } = await checkRateLimit(rateKey, limit, WINDOW_MS);
    const remaining = Math.max(limit - count, 0);

    res.set("X-RateLimit-Limit", String(limit));
    res.set("X-RateLimit-Remaining", String(remaining));

    if (!allowed) {
      return res.status(429).json({
        success: false,
        error: {
          message: "Rate limit terlampaui. Coba lagi setelah beberapa saat.",
          status: 429,
        },
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = rateLimitMiddleware;
