/**
 * Global error handler. Dipasang paling akhir di app.js.
 * Fase-fase selanjutnya (auth, rate limit, dll) cukup `next(err)`
 * atau lempar error dengan `err.statusCode`, dan handler ini yang
 * membentuk response JSON-nya secara konsisten.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      status: statusCode,
    },
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
      status: 404,
    },
  });
}

module.exports = { errorHandler, notFoundHandler };
