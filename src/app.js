const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const env = require("./config/env");
const {
  errorHandler,
  notFoundHandler,
} = require("./middlewares/errorHandler.middleware");

const app = express();

// --- Security & utility middleware (Fase 0) ---
app.use(helmet()); // set header keamanan standar
app.use(cors()); // izinkan cross-origin request
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev")); // request logging
app.use(express.json()); // parse JSON body

// --- Health check ---
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Quotes API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Selamat datang di Quotes API. Lihat /docs untuk dokumentasi (tersedia mulai Fase 7).",
  });
});

// --- Routes (akan diisi mulai Fase 2 & 3) ---
app.use("/api-keys", require("./routes/apiKeys.routes"));
app.use("/quotes", require("./routes/quotes.routes"));
// app.use('/usage', require('./routes/usage.routes'));

// --- 404 & Error handler (selalu paling bawah) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
