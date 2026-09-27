const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminAuthMiddleware = require("../middlewares/adminAuth.middleware");
const {
  generateApiKeyHandler,
  getMyStatusHandler,
  updateTierHandler,
} = require("../controllers/apiKeys.controller");

const router = express.Router();

router.post("/", generateApiKeyHandler);
router.get("/me", authMiddleware, getMyStatusHandler);

// PATCH /api-keys/:id/tier -> admin toggle tier (butuh X-Admin-Key)
router.patch("/:id/tier", adminAuthMiddleware, updateTierHandler);

module.exports = router;
