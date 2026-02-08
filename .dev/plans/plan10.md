# Plan 10: Page Titles and Homepage Halftone Background

- **Date:** 2026-02-08
- **Status:** done

## Context

The live site uses `The Nexus › Podcasts from the Technological Convergence` as its title. Our pages currently use `{title} — thenexus.tv` which doesn't match. The homepage also needs more visual interest — a subtle halftone dot background.

## Changes

### 1. Page Titles

- Added `SITE_NAME = "The Nexus"` constant to `src/data/index.ts`
- Updated `src/layouts/Base.astro` to use `› The Nexus` separator instead of `— thenexus.tv`
- Default (no title prop) becomes `The Nexus › Podcasts from the Technological Convergence`
- Added page numbers to paginated titles (episodes and series) when page > 1
- Removed dead `SITE_TITLE` import from `src/pages/index.astro`
- Added `SITE_NAME` test to `src/data/index.test.ts`

### 2. Homepage Halftone Background

- Added `.nx-halftone` CSS class to `src/styles/global.css` with radial-gradient dots
- Light mode: `rgba(0,0,0,0.15)` 1px dots on 16px grid
- Dark mode: `rgba(255,255,255,0.1)` dots
- Initial opacity values (0.06/0.04) were too faint; bumped to 0.15/0.1
- Applied to hero/villain section on homepage with bleed styling

## Files Modified

- `src/data/index.ts`
- `src/layouts/Base.astro`
- `src/pages/index.astro`
- `src/pages/episodes/[...page].astro`
- `src/pages/series/[...slug].astro`
- `src/styles/global.css`
- `src/data/index.test.ts`
