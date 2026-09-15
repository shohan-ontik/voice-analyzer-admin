# voice-analyzer-admin

Admin panel for voice-analyzer: create user accounts, ban, and unban. A
Next.js app with no direct database access — every action is proxied
through `voice-analyzer-api`.

## Local development

```bash
npm install
cp .env.example .env.local   # points at the backend's /api/v1
npm run dev                   # http://localhost:3001
```

Requires `voice-analyzer-api` running (see its own README) with at least
one seeded admin account to log in with.

## Running with Docker

```bash
cp .env.example .env   # set API_BASE_URL and GEMINI_API_KEY
docker compose up --build -d   # http://localhost:3001
```

`voice-analyzer-api` is a separate service and is **not** included here —
point `API_BASE_URL` in `.env` at wherever it's running:

- Same machine, outside Docker: `http://host.docker.internal:4000/api/v1`
  (Mac/Windows Docker Desktop; on Linux add `extra_hosts: ["host.docker.internal:host-gateway"]`
  to the `admin` service in `docker-compose.yml`, or use the host's LAN IP).
- Another machine/container: its reachable URL, e.g. `http://192.168.1.20:4000/api/v1`.

To build and run without Compose:

```bash
docker build -t voice-analyzer-admin .
docker run -p 3001:3001 --env-file .env voice-analyzer-admin
```

## How auth works

- `/login` posts to `app/api/auth/login/route.ts`, which calls the backend
  and — only if the account's role is `admin` — sets the JWT as an
  httpOnly cookie on this app's own origin. The token never reaches
  client-side JS.
- `proxy.ts` does an optimistic redirect to `/login` when that cookie is
  absent (and away from `/login` when it's present); it does not itself
  validate the token.
- Every other route handler under `app/api/` (`/api/users`, `/api/users/
  [id]/ban`, `/api/users/[id]/unban`) reads the cookie server-side via
  `app/lib/session.ts` and forwards it as `Authorization: Bearer` to the
  backend through `app/lib/apiClient.ts` — that's where real
  authorization (valid signature, admin role, not banned) is enforced.
