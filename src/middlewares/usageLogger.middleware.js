const { logUsage } = require("../services/usage.service");

/**
 * Usage Logger — dipasang GLOBAL di app.js, paling awal (setelah
 * express.json, sebelum semua route). Listener 'finish' langsung
 * terpasang di setiap request apapun hasil akhirnya nanti (200, 401,
 * 429, 500, dst), tapi LOGIKA pencatatannya baru jalan setelah
 * response benar-benar selesai dikirim ke client.
 *
 * Hanya mencatat request yang berhasil melewati authMiddleware
 * (req.apiKeyData sudah terisi), karena usage_logs mensyaratkan
 * api_key_id (foreign key). Request yang gagal auth (401) tidak
 * dicatat karena tidak punya identitas api key yang valid.
 *
 * Pencatatan dijalankan "fire-and-forget" (tidak di-await) supaya
 * lambatnya insert ke Supabase tidak menunda response ke client.
 */
function usageLoggerMiddleware(req, res, next) {
  res.on("finish", () => {
    if (!req.apiKeyData) return;

    logUsage({
      apiKeyId: req.apiKeyData.id,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
    }).catch((err) => {
      console.error("[usageLogger] Gagal mencatat usage log:", err.message);
    });
  });

  next();
}

module.exports = usageLoggerMiddleware;
