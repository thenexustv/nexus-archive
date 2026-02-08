# Plan 3: Coprime-Inspired Theme with Light/Dark Mode

- **Date**: 2026-02-07
- **Status**: done

## Summary

Brought the original Coprime theme's visual identity to the Astro archive with auto light/dark mode support. League Gothic font for the site title, NX logo in the header, warm stone neutrals in dark mode, subtle card shadows, and the idle rotation easter egg from the original site.

## Changes Implemented

### 1. League Gothic font — done
- Copied `.woff` from `.dev/reference/theme/resources/fonts/league-gothic/` to `public/fonts/LeagueGothic.woff`
- `@font-face` declaration in `global.css` with `font-display: swap`
- Registered as `--font-league` in Tailwind `@theme` block

### 2. Dark mode with warm stone neutrals — done
- Tailwind v4 auto dark mode via `prefers-color-scheme` (no custom variant needed)
- Added `<meta name="color-scheme" content="light dark" />` to `<head>`
- All dark mode classes use `stone` series (warmer) instead of `gray`
- Body: `bg-white dark:bg-stone-950 text-gray-900 dark:text-stone-100`
- Header/footer: `bg-gray-50 dark:bg-stone-900 border-gray-200 dark:border-stone-800`
- 15 files updated (3 components, 11 pages, 1 layout)

### 3. NX logo in header — done
- Copied color logo to `public/images/nx-logo.png`
- 28x28 image next to site title in nav
- Grayscale by default, full color on header hover (`group`/`group-hover:grayscale-0`)
- Smooth 300ms filter transition

### 4. Site title styling — done
- "THE NEXUS" in League Gothic uppercase with `tracking-wide`
- `.tv` wrapped in `<span class="sr-only">` (hidden visually, accessible to screen readers)

### 5. Nav layout — done
- About moved to first position in header nav
- Nav links anchored to the right with `ml-auto`

### 6. Idle rotation easter egg — done
- After ~2 min 26s (`1000 * 60 * 2.43`), logo begins continuous 360° rotation
- 30-second cycle, linear timing, infinite loop — matching original Coprime implementation
- `@keyframes logo-rotate` in `global.css`, `.nx-idle-spin` class added via `setTimeout`

### 7. Card shadows — done
- `shadow-sm` on EpisodeCard, PersonCard, series cards, license cards, audio player container

### 8. Dark prose styling — done
- `dark:prose-invert` on all `prose` containers (episode detail, person bio, about, licenses, contact)

### 9. Accent color dark variants — done
- Amber notices: `dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200`
- Amber badges: `dark:bg-amber-900 dark:text-amber-200`
- Blue links: `dark:text-blue-400 dark:hover:text-blue-300`
- Blue info boxes: `dark:bg-blue-950 dark:border-blue-800`

## Files Changed

| File | Change |
|---|---|
| `public/fonts/LeagueGothic.woff` | New — self-hosted font file |
| `public/images/nx-logo.png` | New — NX color logo |
| `src/styles/global.css` | `@font-face`, `@theme`, rotation keyframes, `.nx-idle-spin` |
| `src/layouts/Base.astro` | Dark mode, logo, League Gothic title, nav reorder, easter egg script |
| `src/components/EpisodeCard.astro` | Dark stone variants, shadow |
| `src/components/PersonCard.astro` | Dark stone variants, shadow |
| `src/components/Pagination.astro` | Dark stone variants |
| `src/pages/index.astro` | Dark stone variants on all sections |
| `src/pages/episodes/[slug].astro` | Dark stone variants |
| `src/pages/episodes/[...page].astro` | Dark stone variants |
| `src/pages/series/index.astro` | Dark stone variants |
| `src/pages/series/[...slug].astro` | Dark stone variants |
| `src/pages/people/index.astro` | Dark stone variants |
| `src/pages/people/[slug].astro` | Dark stone variants |
| `src/pages/about.astro` | Dark stone variants, prose-invert |
| `src/pages/licenses.astro` | Dark stone variants, shadows |
| `src/pages/contact.astro` | Dark stone variants |
| `src/pages/404.astro` | Dark stone variants |

## Build Result

- 1545 pages built in ~7-14s
- Zero errors
