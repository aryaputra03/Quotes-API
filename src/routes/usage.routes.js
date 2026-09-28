const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { getUsageHandler } = require("../controllers/usage.controller");

const router = express.Router();

/**
 * @openapi
 * /usage:
 *   get:
 *     summary: Lihat sisa kuota & riwayat pemakaian API key sendiri
 *     tags: [Usage]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Ringkasan kuota dan riwayat pemakaian
 *       401:
 *         description: Header X-API-Key tidak ada / tidak valid / tidak aktif
 */
router.get("/", authMiddleware, getUsageHandler);

module.exports = router;
