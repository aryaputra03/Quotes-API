const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminAuthMiddleware = require("../middlewares/adminAuth.middleware");
const {
  generateApiKeyHandler,
  getMyStatusHandler,
  updateTierHandler,
} = require("../controllers/apiKeys.controller");

const router = express.Router();

/**
 * @openapi
 * /api-keys:
 *   post:
 *     summary: Generate API key baru
 *     tags: [API Keys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [owner_name]
 *             properties:
 *               owner_name:
 *                 type: string
 *                 example: Stavanger
 *               tier:
 *                 type: string
 *                 enum: [free, paid]
 *                 example: free
 *     responses:
 *       201:
 *         description: API key berhasil dibuat (hanya ditampilkan sekali)
 *       400:
 *         description: owner_name kosong / tier tidak valid
 */
router.post("/", generateApiKeyHandler);

/**
 * @openapi
 * /api-keys/me:
 *   get:
 *     summary: Cek status API key milik sendiri
 *     tags: [API Keys]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Status API key (tier, is_active, owner_name, dll)
 *       401:
 *         description: X-API-Key tidak ada / tidak valid
 */
router.get("/me", authMiddleware, getMyStatusHandler);

/**
 * @openapi
 * /api-keys/{id}/tier:
 *   patch:
 *     summary: "[Admin] Ubah tier sebuah API key secara manual"
 *     tags: [API Keys]
 *     security:
 *       - AdminKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: id (uuid) baris di tabel api_keys
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tier]
 *             properties:
 *               tier:
 *                 type: string
 *                 enum: [free, paid]
 *     responses:
 *       200:
 *         description: Tier berhasil diubah
 *       400:
 *         description: Field tier kosong / tidak valid
 *       401:
 *         description: Header X-Admin-Key tidak valid
 *       404:
 *         description: API key tidak ditemukan
 */
// PATCH /api-keys/:id/tier -> admin toggle tier (butuh X-Admin-Key)
router.patch("/:id/tier", adminAuthMiddleware, updateTierHandler);

module.exports = router;
