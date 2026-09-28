const supabase = require("../config/supabase");

/**
 * Simpan satu baris log pemakaian ke tabel usage_logs.
 * Dipanggil oleh usageLogger.middleware.js setelah response benar-benar
 * selesai dikirim (res.on('finish')), jadi status code yang dicatat
 * sudah final (200, 404, 429, 500, dst).
 *
 * @param {{ apiKeyId: string, endpoint: string, statusCode: number }} params
 */
async function logUsage({ apiKeyId, endpoint, statusCode }) {
  const { error } = await supabase.from("usage_logs").insert({
    api_key_id: apiKeyId,
    endpoint,
    status_code: statusCode,
  });

  if (error) {
    throw new Error(`Gagal menyimpan usage log: ${error.message}`);
  }
}

/**
 * Ambil riwayat pemakaian (usage_logs) milik satu API key, terbaru dulu.
 * Dibatasi `limit` baris supaya response GET /usage tidak membengkak
 * kalau riwayatnya sudah panjang.
 *
 * @param {string} apiKeyId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function getUsageHistory(apiKeyId, limit = 50) {
  const { data, error } = await supabase
    .from("usage_logs")
    .select("endpoint, status_code, requested_at")
    .eq("api_key_id", apiKeyId)
    .order("requested_at", { ascending: false })
    .limit(limit);

  if (error) {
    const err = new Error(`Gagal mengambil riwayat pemakaian: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }

  return data || [];
}

module.exports = { logUsage, getUsageHistory };