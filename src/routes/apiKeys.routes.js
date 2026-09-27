const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  generateApiKeyHandler,
  getMyStatusHandler,
} = require("../controllers/apiKeys.controller");

const router = express.Router();

// POST /api-keys          -> generate API key baru (tanpa auth, "pendaftaran")
router.post("/", generateApiKeyHandler);

// GET  /api-keys/me       -> cek status API key milik sendiri (butuh X-API-Key)
router.get("/me", authMiddleware, getMyStatusHandler);

module.exports = router;
