# Plan 11: Docker Deployment

- **Date:** 2026-02-08
- **Status:** done

## Context

The nexus-archive site needs containerization for deployment on a VPS behind an Apache reverse proxy. The Astro site uses the `@astrojs/node` standalone adapter — it pre-renders static HTML at build time but runs a small Node server at runtime for serving files and handling middleware redirects. The standalone adapter bundles everything into self-contained ESM files, so **no `node_modules` are needed at runtime**.

## Files Created

### 1. `Dockerfile`

Multi-stage build:

**Stage 1 — Builder (`node:24-alpine`):**
- Enable pnpm via corepack
- Copy dependency manifests, `pnpm install --frozen-lockfile`
- Copy source + export data, `pnpm build`

**Stage 2 — Runtime (`node:24-alpine`):**
- Install curl for health checks
- Copy only `dist/client/` and `dist/server/` from builder (owned by `node` user)
- Run as non-root `node` user (UID 1000, built into official Node images)
- Set `HOST=0.0.0.0` and `PORT=4321`
- `CMD ["node", "./dist/server/entry.mjs"]`

### 2. `.dockerignore`

Exclude: `node_modules/`, `dist/`, `.astro/`, `.git/`, `.dev/`, `.claude/`, `.idea/`, `.DS_Store`, `.env*`, `*.log`, `vitest.config.ts`, `README.md`, `CLAUDE.md`

Keep: `export/` (needed at build time for JSON data)

### 3. `docker-compose.yml`

Single-service compose with `curl`-based health check against `/api/health` endpoint.

### 4. `src/middleware.ts`

Added `/api/health` endpoint as early return in existing middleware — returns plain `200 ok` before any redirect logic.

## Key Details

- **No runtime deps:** The Astro standalone adapter bundles all code (including the 4.4MB episode data) into `dist/server/`. All imports are relative or `node:` built-ins.
- **Non-root execution:** Runtime runs as the built-in `node` user (UID 1000) for security.
- **Layer caching:** Dependency manifests are copied before source so `pnpm install` only re-runs when deps change.
- **Build context ~5.5MB:** Source + export JSON + lockfile (node_modules and dist excluded by .dockerignore).
- **Apache proxy reference:** `ProxyPass / http://127.0.0.1:4321/` with `ProxyPassReverse` and `ProxyPreserveHost On`.

## Verification

- `docker compose build` — succeeds
- `docker compose up -d` — container starts
- `curl http://localhost:4321/api/health` — returns "ok"
- `docker inspect nexus-archive` — health check shows "healthy" after ~40s
- `pnpm build` — still works locally (no regressions)
