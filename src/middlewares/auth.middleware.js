const { getApiKeyByKey } = require("../services/apiKeys.service");

/**
 * Middleware auth berbasis API Key (bukan JWT/session).
 * Alur:
 * 1. Ambil header X-API-Key.
 * 2. Kalau tidak ada -> 401.
 * 3. Cari di tabel api_keys lewat service.
 * 4. Kalau tidak ketemu / tidak aktif -> 401.
 * 5. Kalau valid, tempelkan datanya ke req.apiKeyData supaya middleware
 *    berikutnya (rateLimit, tier, cache, usage logger di fase-fase
 *    selanjutnya) tidak perlu query ulang ke database.
 */
async function authMiddleware(req, res, next) {
  const apiKey = req.header("X-API-Key");

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: { message: "Header X-API-Key wajib disertakan", status: 401 },
    });
  }

  try {
    const keyData = await getApiKeyByKey(apiKey);

    if (!keyData) {
      return res.status(401).json({
        success: false,
        error: { message: "API Key tidak valid", status: 401 },
      });
    }

    if (!keyData.is_active) {
      return res.status(401).json({
        success: false,
        error: { message: "API Key tidak aktif", status: 401 },
      });
    }

    // Dipakai oleh middleware/controller berikutnya, contoh:
    // req.apiKeyData.tier, req.apiKeyData.id, req.apiKeyData.owner_name
    req.apiKeyData = keyData;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
