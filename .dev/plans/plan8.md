# Plan 8: Set Up Vitest for Automated Testing

- **Date:** 2026-02-08
- **Status:** done

## Context

The project had no test framework. The data layer (`src/data/index.ts`) contains pure helper functions and query functions ideal for unit testing. The `AudioPlayer.tsx` component also has testable utility functions. Setting up vitest enables automated verification of the data layer logic.

## Changes Made

### Packages Installed
- `vitest` (dev dependency)

### Files Created
- `vitest.config.ts` — standalone vitest config (not integrated into `astro.config.mjs`)
- `src/data/index.test.ts` — data layer tests
- `src/components/AudioPlayer.test.ts` — `parseDuration` and `formatTime` tests

### Files Modified
- `package.json` — added `test` and `test:watch` scripts
- `src/data/index.ts` — exported `slugifyName`, `makeEpisodeSlug`, `gravatarUrl`, `processContent`
- `src/components/AudioPlayer.tsx` — exported `parseDuration` and `formatTime`

## Test Coverage

### `src/data/index.test.ts`
- `slugifyName` — lowercasing, space-to-hyphen, stripping non-alphanumeric, trimming edge hyphens
- `makeEpisodeSlug` — concatenation
- `gravatarUrl` — null for undefined/empty email, gravatar URL with md5 hash, case/whitespace normalization
- `processContent` — adds target=_blank to external links, skips existing targets, skips relative links
- `getAllSeries` — non-empty, excludes zero-episode series, sorted alphabetically
- `getSeriesBySlug` — finds known series, returns undefined for nonexistent
- `getAllEpisodes` — sorted newest-first, each has non-empty slug
- `getEpisodeBySlug` — finds known episode, returns undefined for nonexistent
- `getAllPeople` — sorted by episode count descending
- `SITE_TITLE` and `EPISODES_PER_PAGE` — constant values

### `src/components/AudioPlayer.test.ts`
- `parseDuration` — null, empty string, h:mm:ss, mm:ss, seconds-only
- `formatTime` — under a minute, minutes+seconds, zero, hours+minutes+seconds, fractional seconds

## Decisions

- **No post-build tests.** Unit tests cover the data layer, and Astro's build fails on type/data errors. Post-build smoke tests (checking HTML files in `dist/`) would mostly re-test that Astro works. Template/routing issues are caught immediately by `pnpm preview`.
