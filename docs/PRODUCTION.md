# Carschek frontend — production deploy

Next.js 15 App Router app. Pair with the Laravel API guide: `../carschek-api/docs/PRODUCTION.md` (or your API clone’s `docs/PRODUCTION.md`).

## Environment

Copy templates (never commit real secrets):

```powershell
Copy-Item .env.example .env.local
# For production host / CI, use values from .env.production.example
```

| Variable | Production |
|----------|------------|
| `NEXT_PUBLIC_USE_API_MOCK` | `false` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.yourdomain.com/api/v1` |
| `NEXT_PUBLIC_ENABLE_AUTH_GUARD` | `true` |
| `NEXT_PUBLIC_DISABLE_MIDDLEWARE` | `false` |
| `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS` | `false` (omit; production builds hide the panel) |

`.env`, `.env.local`, and `.env.production` are gitignored. Local WAMP continues to use `.env.local`.

### Auth middleware

With `NEXT_PUBLIC_ENABLE_AUTH_GUARD=true`, unauthenticated visits to `/dashboard` redirect to `/authentication-screen` (cookie `carschek-auth` / `carschek-role`). Keep `NEXT_PUBLIC_DISABLE_MIDDLEWARE=false` in production.

On API `401`, the axios client clears the bearer token + session cookies and redirects to login.

### CORS

API `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS` must match this app’s browser origin (e.g. `https://app.yourdomain.com`).

## Build & run

```powershell
npm ci
npm run build
npm run serve
```

- `npm run dev` — local development (port 4028)
- `npm run build` — production build
- `npm run serve` — `next start` (production server)
- `npm start` — same as `serve` (production)

Point the reverse proxy (Apache/nginx) at the Node process, or host behind a Node-capable platform. This app is **not** configured for static `output: 'export'` (API routes / middleware need a Node server).

Minimal security headers are set in `next.config.mjs` (`X-Content-Type-Options`, `Referrer-Policy`, etc.). `X-Frame-Options` is intentionally omitted so PDF/embed flows are not broken.

## Operator must set

1. `NEXT_PUBLIC_API_BASE_URL` to the real API
2. Matching CORS on the API
3. TLS for `app.yourdomain.com`
4. Production env without demo accounts / middleware bypass
