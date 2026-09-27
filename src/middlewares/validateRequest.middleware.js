const { validationResult } = require("express-validator");

/**
 * Dipasang setelah array validation chain express-validator
 * (misal `query('name').notEmpty()`), sebelum controller.
 * Kalau ada error validasi, langsung balas 400 dengan detail field
 * mana yang salah — controller tidak perlu tahu soal validasi sama sekali.
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Query parameter tidak valid",
        status: 400,
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      },
    });
  }

  next();
}

module.exports = validateRequest;
