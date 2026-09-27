require("dotenv").config();

/**
 * Kumpulan environment variable yang dipakai di seluruh aplikasi.
 * Disentralisasi di sini supaya tidak ada `process.env.X` tersebar
 * di banyak file, dan supaya default value gampang di-track.
 */
const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 3000,

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,

  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,

  RATE_LIMIT_FREE_PER_DAY:
    parseInt(process.env.RATE_LIMIT_FREE_PER_DAY, 10) || 100,
  RATE_LIMIT_PAID_PER_DAY:
    parseInt(process.env.RATE_LIMIT_PAID_PER_DAY, 10) || 10000,

  ADMIN_SECRET: process.env.ADMIN_SECRET || "1234",
};

// Validasi minimal: pastikan variabel wajib untuk fase selanjutnya tidak kosong.
const requiredForLaterPhases = ["SUPABASE_URL", "SUPABASE_KEY", "ADMIN_SECRET"];
requiredForLaterPhases.forEach((key) => {
  if (!env[key]) {
    console.warn(
      `[env] Warning: ${key} belum di-set di .env — dibutuhkan mulai Fase 1.`,
    );
  }
});

module.exports = env;
