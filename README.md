# Quotes API — Rate-Limited Public API Service

Simulasi API publik komersial (mirip OpenWeatherMap / RapidAPI) di mana produk yang
"dijual" bukan aplikasi dengan UI, melainkan akses data lewat API key. Fokus project
ini bukan pada data yang ditampilkan, tapi pada infrastruktur backend: autentikasi,
rate limiting, tiering, caching, dan usage analytics.

**Studio / Developer:** Mazif Studio — Stavanger

## Fitur

- 🔑 Manajemen API Key (generate, cek status, admin toggle tier)
- 🛡️ Autentikasi berbasis header `X-API-Key`
- ⏱️ Rate limiting sliding window (Redis sorted set) — bukan fixed window
- 🎚️ Tiering Free (100 req/hari) vs Paid (10.000 req/hari)
- 📚 Endpoint quotes: random, by-author, by-category, all (dengan pagination)
- ⚡ HTTP caching (Redis + `Cache-Control` & `ETag`) untuk endpoint yang sering diakses
- 📊 Usage analytics per API key (`GET /usage`)
- 📖 Dokumentasi OpenAPI/Swagger otomatis di `/docs`
- 🌐 Nginx sebagai reverse proxy di depan Express

## Tech Stack

| Layer               | Teknologi                         |
| ------------------- | --------------------------------- |
| Runtime & Framework | Node.js, Express.js               |
| Database            | Supabase (PostgreSQL)             |
| Cache & Rate Limit  | Redis (ioredis)                   |
| Reverse Proxy       | Nginx                             |
| Keamanan            | Helmet, CORS, express-validator   |
| Dokumentasi API     | swagger-jsdoc, swagger-ui-express |
| Utility             | dotenv, morgan                    |

## Setup Lokal

```bash
git clone https://github.com/aryaputra03/Quotes-API.git
cd Quotes-API
npm install
cp .env.example .env   # lalu isi dengan kredensial Supabase & Redis Anda
npm run dev
```

### Environment Variables (`.env`)

| Variable                  | Keterangan                         | Default       |
| ------------------------- | ---------------------------------- | ------------- |
| `NODE_ENV`                | `development` / `production`       | `development` |
| `PORT`                    | Port Express                       | `3000`        |
| `SUPABASE_URL`            | URL project Supabase               | –             |
| `SUPABASE_KEY`            | Service role key Supabase          | –             |
| `REDIS_HOST`              | Host Redis                         | `127.0.0.1`   |
| `REDIS_PORT`              | Port Redis                         | `6379`        |
| `REDIS_PASSWORD`          | Password Redis (opsional)          | –             |
| `RATE_LIMIT_FREE_PER_DAY` | Limit harian tier free             | `100`         |
| `RATE_LIMIT_PAID_PER_DAY` | Limit harian tier paid             | `10000`       |
| `ADMIN_SECRET`            | Shared secret untuk endpoint admin | –             |

## Endpoint

| Method | Path                            | Auth          | Keterangan                     |
| ------ | ------------------------------- | ------------- | ------------------------------ |
| GET    | `/health`                       | –             | Health check                   |
| POST   | `/api-keys`                     | –             | Generate API key baru          |
| GET    | `/api-keys/me`                  | `X-API-Key`   | Cek status API key sendiri     |
| PATCH  | `/api-keys/:id/tier`            | `X-Admin-Key` | Ubah tier API key (admin)      |
| GET    | `/quotes/random`                | `X-API-Key`   | 1 quote acak                   |
| GET    | `/quotes/by-author?name=`       | `X-API-Key`   | Filter by author               |
| GET    | `/quotes/by-category?category=` | `X-API-Key`   | Filter by kategori (cached)    |
| GET    | `/quotes/all?page=&limit=`      | `X-API-Key`   | List + pagination (cached)     |
| GET    | `/usage`                        | `X-API-Key`   | Sisa kuota & riwayat pemakaian |
| GET    | `/docs`                         | –             | Dokumentasi Swagger UI         |

Detail lengkap tiap endpoint (schema, contoh response, status code) ada di `/docs`.

## Arsitektur Middleware
