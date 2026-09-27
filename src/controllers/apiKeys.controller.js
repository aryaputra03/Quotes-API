const {
  createApiKey,
  updateApiKeyTier,
  ALLOWED_TIERS,
} = require("../services/apiKeys.service");

/**
 * POST /api-keys
 * Body: { owner_name: string, tier?: 'free' | 'paid' }
 * Endpoint ini sengaja belum diproteksi auth — dipakai untuk daftar
 * awal jadi pengguna API. Kalau mau dibatasi (misal cuma admin yang
 * boleh generate key), tinggal pasang middleware khusus admin nanti.
 */
async function generateApiKeyHandler(req, res, next) {
  try {
    const { owner_name: ownerName, tier } = req.body || {};

    if (!ownerName || typeof ownerName !== "string" || !ownerName.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            'Field "owner_name" wajib diisi (string, tidak boleh kosong)',
          status: 400,
        },
      });
    }

    if (tier !== undefined && !ALLOWED_TIERS.includes(tier)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Field "tier" kalau diisi harus salah satu dari: ${ALLOWED_TIERS.join(", ")}`,
          status: 400,
        },
      });
    }

    const created = await createApiKey({ ownerName: ownerName.trim(), tier });

    res.status(201).json({
      success: true,
      message:
        "API key berhasil dibuat. Simpan baik-baik, key ini tidak akan ditampilkan lagi.",
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api-keys/me
 * Butuh header X-API-Key (divalidasi oleh auth.middleware sebelum
 * masuk ke sini). Mengembalikan status key milik pemanggil sendiri —
 * bukan daftar semua key, supaya tidak bocorkan data owner lain.
 */
function getMyStatusHandler(req, res) {
  const { api_key: _apiKey, ...safeData } = req.apiKeyData;

  res.status(200).json({
    success: true,
    data: safeData,
  });
}

/**
 * PATCH /api-keys/:id/tier
 * Body: { tier: 'free' | 'paid' }
 * Endpoint admin sederhana untuk toggle tier API key secara manual
 * (tanpa payment gateway) — diproteksi adminAuth.middleware.js.
 */
async function updateTierHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { tier } = req.body || {};

    if (!ALLOWED_TIERS.includes(tier)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Field "tier" wajib diisi, salah satu dari: ${ALLOWED_TIERS.join(", ")}`,
          status: 400,
        },
      });
    }

    const updated = await updateApiKeyTier(id, tier);
    const { api_key: _apiKey, ...safeData } = updated;

    res.status(200).json({
      success: true,
      message: `Tier API key berhasil diubah menjadi "${tier}"`,
      data: safeData,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateApiKeyHandler,
  getMyStatusHandler,
  updateTierHandler,
};
