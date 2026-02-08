# Plan 5: Old URL Redirect Middleware + Episode Layout Cleanup

- **Date**: 2026-02-07
- **Status**: done

## Summary

Added Astro middleware to redirect old WordPress-era URLs to their canonical equivalents. Switched to hybrid output mode with `@astrojs/node` adapter so middleware runs server-side. Also widened episode and person detail page layouts from `max-w-3xl` to `max-w-5xl`.

## Slug Format Change

During implementation, decided to remove the dash from episode slugs. Canonical format is now `atn123` instead of `atn-123`, matching the original WordPress URLs.

- `makeEpisodeSlug` in `src/data/index.ts` changed from `${series}-${number}` to `${series}${number}`
- All episode URLs site-wide updated automatically (built from `episode.slug`)

## Redirect Rules

| Old URL | Redirects to | Status |
|---|---|---|
| `/episode/atn123` | `/episodes/atn123/` | 301 |
| `/episode/atn-123` | `/episodes/atn123/` | 301 |
| `/atn123` (root-level) | `/episodes/atn123/` | 301 |
| `/episode/` | `/episodes/` | 301 |
| `/episode/nonexistent999` | Falls through to 404 | — |

### Slug Parsing Logic

- Known series slugs loaded from data layer, sorted longest-first for prefix matching
- Dashed inputs (`atn-123`) → strip dash → `atn123`
- Dashless inputs (`atn123`) → match known series prefix → validate as episode → redirect
- Unknown slugs fall through to 404 (no redirect)

## Layout Changes

- `src/pages/episodes/[slug].astro`: `max-w-3xl` → `max-w-5xl`
- `src/pages/people/[slug].astro`: `max-w-3xl` → `max-w-5xl`

## Files Changed

| File | Change |
|---|---|
| `package.json` | Added `@astrojs/node` dependency |
| `pnpm-lock.yaml` | Updated lockfile |
| `astro.config.mjs` | Added node adapter, configured hybrid output |
| `src/middleware.ts` | New — old URL redirect logic |
| `src/data/index.ts` | Removed dash from `makeEpisodeSlug` |
| `src/pages/episodes/[slug].astro` | `max-w-3xl` → `max-w-5xl` |
| `src/pages/people/[slug].astro` | `max-w-3xl` → `max-w-5xl` |

## Build Result

- All pages built successfully
- Episode URLs now dashless (e.g. `/episodes/tf587/`, `/episodes/atn123/`)
