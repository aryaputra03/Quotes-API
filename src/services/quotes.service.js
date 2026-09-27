const supabase = require("../config/supabase");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Ambil 1 quote secara acak.
 * Strategi: hitung total baris dulu (count-only query, tanpa fetch data),
 * lalu generate offset acak dan ambil 1 baris di posisi itu lewat .range().
 * Ini menghindari `ORDER BY random()` yang mahal kalau tabel besar.
 */
async function getRandomQuote() {
  const { count, error: countError } = await supabase
    .from("quotes")
    .select("*", { count: "exact", head: true });

  if (countError) {
    const err = new Error(
      `Gagal menghitung jumlah quotes: ${countError.message}`,
    );
    err.statusCode = 500;
    throw err;
  }

  if (!count) return null;

  const randomOffset = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .range(randomOffset, randomOffset);

  if (error) {
    const err = new Error(`Gagal mengambil quote acak: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }

  return data?.[0] || null;
}

/**
 * Cari quotes berdasarkan nama author (partial match, case-insensitive).
 */
async function getByAuthor(name) {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .ilike("author", `%${name}%`)
    .order("created_at", { ascending: false });

  if (error) {
    const err = new Error(
      `Gagal mencari quotes berdasarkan author: ${error.message}`,
    );
    err.statusCode = 500;
    throw err;
  }

  return data || [];
}

/**
 * Cari quotes berdasarkan category (exact match, case-insensitive).
 */
async function getByCategory(category) {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .ilike("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    const err = new Error(
      `Gagal mencari quotes berdasarkan category: ${error.message}`,
    );
    err.statusCode = 500;
    throw err;
  }

  return data || [];
}

/**
 * List semua quotes dengan pagination.
 */
async function getAllQuotes({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
} = {}) {
  const safeLimit = Math.min(limit, MAX_LIMIT);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { data, error, count } = await supabase
    .from("quotes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    const err = new Error(`Gagal mengambil daftar quotes: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }

  return {
    data: data || [],
    pagination: {
      page,
      limit: safeLimit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / safeLimit),
    },
  };
}

module.exports = {
  getRandomQuote,
  getByAuthor,
  getByCategory,
  getAllQuotes,
  MAX_LIMIT,
};
