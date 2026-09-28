const rateLimitMiddleware = require("../middlewares/rateLimit.middleware");
const { getLimitForTier } = require("../middlewares/tier.middleware");
const { getCurrentUsage } = require("../services/rateLimiter.service");
const { getUsageHistory } = require("../services/usage.service");

/**
 * GET /usage
 * Butuh header X-API-Key (divalidasi authMiddleware sebelum masuk sini).
 */
async function getUsageHandler(req, res, next) {
  try {
    const { api_key: apiKey, id: apiKeyId, tier } = req.apiKeyData;
    const limit = getLimitForTier(tier);
    const windowMs = rateLimitMiddleware.WINDOW_MS;

    const [used, history] = await Promise.all([
      getCurrentUsage(`rate:${apiKey}`, windowMs),
      getUsageHistory(apiKeyId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tier,
        limit,
        used,
        remaining: Math.max(limit - used, 0),
        window: "24 jam terakhir",
        history,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getUsageHandler };
