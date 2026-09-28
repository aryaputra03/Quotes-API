const express = require("express");
const { query } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest.middleware");
const {
  randomHandler,
  byAuthorHandler,
  byCategoryHandler,
  allHandler,
} = require("../controllers/quotes.controller");

const rateLimitMiddleware = require("../middlewares/rateLimit.middleware");

const { tierMiddleware } = require("../middlewares/tier.middleware");

const cacheMiddleware = require("../middlewares/cache.middleware");

// Harus sinkron dengan kategori yang ada di seed data (Fase 1).
// Ganti/tambah di sini kalau nanti ada kategori baru.
const ALLOWED_CATEGORIES = [
  "motivasi",
  "bisnis",
  "kehidupan",
  "cinta",
  "humor",
];

const router = express.Router();

// Semua endpoint /quotes adalah core feature yang diukur & dibatasi,
// jadi wajib pakai X-API-Key (sesuai urutan middleware: Auth di depan).
router.use(authMiddleware);

// Tier Check: petakan tier -> limit harian, taruh di req.rateLimitConfig,
// supaya rateLimitMiddleware di bawah ini tahu limit mana yang dipakai.
router.use(tierMiddleware);

// Rate limit dipasang tepat setelah auth — sesuai "Urutan Middleware (Recap)"
// di roadmap: Auth harus lebih dulu karena Rate Limit butuh identitas (apiKeyData).
router.use(rateLimitMiddleware);

/**
 * @openapi
 * /quotes/random:
 *   get:
 *     summary: Ambil 1 quote secara acak
 *     tags: [Quotes]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Satu quote acak
 *       401:
 *         description: X-API-Key tidak ada / tidak valid
 *       404:
 *         description: Belum ada data quotes di database
 *       429:
 *         description: Rate limit terlampaui
 */
router.get("/random", randomHandler);

/**
 * @openapi
 * /quotes/by-author:
 *   get:
 *     summary: Cari quotes berdasarkan nama author (partial match)
 *     tags: [Quotes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nama author (boleh sebagian, case-insensitive)
 *     responses:
 *       200:
 *         description: Daftar quotes yang cocok
 *       400:
 *         description: Query parameter "name" kosong
 *       401:
 *         description: X-API-Key tidak ada / tidak valid
 *       429:
 *         description: Rate limit terlampaui
 */
router.get(
  "/by-author",
  [
    query("name")
      .trim()
      .notEmpty()
      .withMessage('Query parameter "name" wajib diisi'),
  ],
  validateRequest,
  byAuthorHandler,
);

/**
 * @openapi
 * /quotes/by-category:
 *   get:
 *     summary: Cari quotes berdasarkan kategori (di-cache 5 menit)
 *     tags: [Quotes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [motivasi, bisnis, kehidupan, cinta, humor]
 *         description: Kategori quote
 *     responses:
 *       200:
 *         description: Daftar quotes dalam kategori tsb (header X-Cache HIT/MISS)
 *       400:
 *         description: Query parameter "category" kosong / bukan kategori yang valid
 *       401:
 *         description: X-API-Key tidak ada / tidak valid
 *       429:
 *         description: Rate limit terlampaui
 */
router.get(
  "/by-category",
  [
    query("category")
      .trim()
      .notEmpty()
      .withMessage('Query parameter "category" wajib diisi')
      .bail()
      .isIn(ALLOWED_CATEGORIES)
      .withMessage(
        `Query parameter "category" harus salah satu dari: ${ALLOWED_CATEGORIES.join(", ")}`,
      ),
  ],
  validateRequest,
  cacheMiddleware({ ttlSeconds: 300 }),
  byCategoryHandler,
);

/**
 * @openapi
 * /quotes/all:
 *   get:
 *     summary: List semua quotes dengan pagination (di-cache 5 menit)
 *     tags: [Quotes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Daftar quotes + info pagination (header X-Cache HIT/MISS)
 *       400:
 *         description: Query parameter page/limit tidak valid
 *       401:
 *         description: X-API-Key tidak ada / tidak valid
 *       429:
 *         description: Rate limit terlampaui
 */
router.get(
  "/all",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage('Query parameter "page" harus bilangan bulat >= 1'),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Query parameter "limit" harus bilangan bulat antara 1-100'),
  ],
  validateRequest,
  cacheMiddleware({ ttlSeconds: 300 }),
  allHandler,
);

module.exports = router;
