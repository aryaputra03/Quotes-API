const supabase = require("../config/supabase");
const generateApiKey = require("../utils/generateApiKey");

const ALLOWED_TIERS = ["free", "paid"];

/**
 * Buat API key baru dan simpan ke tabel api_keys.
 * @param {{ ownerName: string, tier?: string }} params
 * @returns {Promise<object>} baris api_keys yang baru dibuat
 */
async function createApiKey({ ownerName, tier }) {
  const finalTier = ALLOWED_TIERS.includes(tier) ? tier : "free";
  const apiKey = generateApiKey();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      api_key: apiKey,
      owner_name: ownerName,
      tier: finalTier,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    const err = new Error(`Gagal membuat API key: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }

  return data;
}

/**
 * Ambil satu baris api_keys berdasarkan nilai api_key.
 * Dipakai oleh auth.middleware untuk validasi header X-API-Key.
 * @param {string} apiKey
 * @returns {Promise<object|null>} null kalau tidak ditemukan
 */
async function getApiKeyByKey(apiKey) {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("api_key", apiKey)
    .maybeSingle();

  if (error) {
    const err = new Error(`Gagal query API key: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }

  return data;
}

/**
 * Update tier sebuah API key (dipakai endpoint admin toggle tier).
 * @param {string} id - id (uuid) baris di tabel api_keys
 * @param {string} tier - 'free' | 'paid'
 * @returns {Promise<object>} baris api_keys setelah diupdate
 */
async function updateApiKeyTier(id, tier) {
  const { data, error } = await supabase
    .from("api_keys")
    .update({ tier })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const err = new Error(`Gagal update tier API key: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }

  if (!data) {
    const err = new Error("API key tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  return data;
}

module.exports = {
  createApiKey,
  getApiKeyByKey,
  updateApiKeyTier,
  ALLOWED_TIERS,
};
