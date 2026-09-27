const env = require("../config/env");

/**
 * Proteksi sederhana untuk endpoint admin (toggle tier, dsb).
 * Bukan sistem role/permission penuh — cuma shared-secret di header,
 * cukup untuk kebutuhan "admin sederhana, tanpa payment gateway"
 * sesuai Fase 5. Kalau nanti butuh multi-admin dengan hak akses
 * berbeda-beda, ini yang pertama harus diganti jadi sistem auth asli.
 */
function adminAuthMiddleware(req, res, next) {
  const adminKey = req.header("X-Admin-Key");

  if (!adminKey || adminKey !== env.ADMIN_SECRET) {
    return res.status(401).json({
      success: false,
      error: { message: "Header X-Admin-Key tidak valid", status: 401 },
    });
  }

  next();
}

module.exports = adminAuthMiddleware;
