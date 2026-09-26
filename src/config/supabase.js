const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

/**
 * Supabase client singleton.
 * Dipakai oleh services (quotes.service.js, apiKeys.service.js, dll)
 * untuk query ke tabel quotes, api_keys, usage_logs.
 *
 * Catatan: gunakan SERVICE ROLE KEY (bukan anon key) di .env untuk
 * backend, karena middleware auth & rate limit butuh akses penuh
 * tanpa terhalang Row Level Security policy milik user biasa.
 */
if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
  console.warn(
    "[supabase] SUPABASE_URL / SUPABASE_KEY belum di-set. Client akan gagal saat query.",
  );
}

const supabase = createClient(
  env.SUPABASE_URL || "https://placeholder.supabase.co",
  env.SUPABASE_KEY || "placeholder-key",
);

module.exports = supabase;
