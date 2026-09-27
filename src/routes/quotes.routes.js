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

router.get("/random", randomHandler);

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
  byCategoryHandler,
);

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
  allHandler,
);

module.exports = router;
