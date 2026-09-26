const app = require("./src/app");
const env = require("./src/config/env");

require("./src/config/redis"); // trigger koneksi Redis saat server start

app.listen(env.PORT, () => {
  console.log(
    `[server] Quotes API berjalan di http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
});
