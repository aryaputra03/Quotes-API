const swaggerJsdoc = require("swagger-jsdoc");

/**
 * Baca komentar @openapi di setiap file src/routes/*.js lalu rakit
 * jadi satu dokumen OpenAPI 3.0. Dokumentasi jadi berdampingan
 * langsung dengan definisi endpoint-nya — kalau route berubah,
 * dokumentasinya diedit di tempat yang sama.
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quotes API",
      version: "1.0.0",
      description: "Rate-Limited Public API Service (API-as-a-Product).",
    },
    servers: [{ url: "/", description: "Server saat ini" }],
    tags: [
      { name: "Quotes", description: "Endpoint utama pengambilan quotes" },
      { name: "API Keys", description: "Manajemen API key" },
      { name: "Usage", description: "Kuota & riwayat pemakaian" },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: "apiKey", in: "header", name: "X-API-Key" },
        AdminKeyAuth: { type: "apiKey", in: "header", name: "X-Admin-Key" },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
