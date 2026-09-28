const crypto = require("crypto");
const { getCache, setCache } = require("../services/cache.service");

const DEFAULT_TTL_SECONDS = 5 * 60; // 5 menit, sesuai saran roadmap (5-10 menit)

function generateETag(payload) {
  const hash = crypto
    .createHash("sha1")
    .update(JSON.stringify(payload))
    .digest("hex");
  return `"${hash}"`;
}

/**
 * Factory middleware — dipasang PER ROUTE (bukan global), cuma di
 * endpoint yang ditunjuk roadmap: /quotes/all & /quotes/by-category.
 * Endpoint /random & /by-author sengaja TIDAK di-cache: /random
 * memang harus selalu beda tiap panggilan, dan /by-author cukup
 * jarang dipakai dibanding 2 endpoint tadi.
 *
 * Alur:
 * 1. Cek Redis pakai key `cache:<originalUrl>` (URL + query string).
 * 2. HIT  -> set Cache-Control & ETag, cek If-None-Match -> 304 kalau
 *           sama, kalau tidak kirim data dari cache (skip controller).
 * 3. MISS -> lanjut ke controller (next()), tapi res.json() di-"sadap"
 *           supaya hasilnya disimpan ke Redis sebelum dikirim ke client.
 *
 * Wajib dipasang SETELAH validateRequest (supaya tidak menyimpan cache
 * untuk query parameter yang sebenarnya invalid) dan tepat SEBELUM
 * controller — sesuai "Urutan Middleware (Recap)": Cache Check
 * dipasang setelah Rate Limit, sebelum Controller.
 */
function cacheMiddleware({ ttlSeconds = DEFAULT_TTL_SECONDS } = {}) {
  return async function cacheMiddlewareHandler(req, res, next) {
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      const cached = await getCache(cacheKey);

      if (cached) {
        const etag = generateETag(cached);
        res.set("Cache-Control", `public, max-age=${ttlSeconds}`);
        res.set("ETag", etag);
        res.set("X-Cache", "HIT");

        if (req.header("If-None-Match") === etag) {
          return res.status(304).end();
        }

        return res.status(200).json(cached);
      }

      // Cache MISS: sadap res.json supaya body yang dikirim controller
      // otomatis tersimpan ke Redis, tanpa controller perlu tahu soal cache.
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(cacheKey, body, ttlSeconds).catch((err) => {
            console.error("[cache] Gagal menyimpan cache:", err.message);
          });

          const etag = generateETag(body);
          res.set("Cache-Control", `public, max-age=${ttlSeconds}`);
          res.set("ETag", etag);
        }
        res.set("X-Cache", "MISS");
        return originalJson(body);
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = cacheMiddleware;
