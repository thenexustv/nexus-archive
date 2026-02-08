# Plan 16: 5 Easter Eggs

- **Date**: 2026-02-08
- **Status**: done

## Summary

Added 5 fun easter eggs to the podcast archive site, plus a consistency fix for episode card borders.

## Easter Eggs Implemented

### 1. Episode 404 (`src/pages/404.astro`)
Replaced the generic 404 page with a fake episode card styled like a real episode detail page. Features a humorous description about a "lost episode," fake date (February 30, 2014), fake hosts ("The Usual Suspects"), and infinite duration. Includes a "Transmission Error" notice and navigation buttons.

### 2. Console ASCII Logo (`src/layouts/Base.astro`)
Added a styled `console.info` that prints a simplified NX ASCII art logo using the brand colors (red #E53030 for the N, blue #2BA0E5 for the X), followed by the message "Looking under the hood? We always loved doing that too." in the same split colors.

### 3. Total Listen Time (`src/pages/index.astro`)
Calculated total runtime of all episodes at build time by summing all `episode.media.length` values (HH:MM:SS strings). Displays rounded-up hours (e.g. "1,221 hours of audio") with a `cursor-help` tooltip showing the equivalent in days. Full-bleed halftone hero section extends edge-to-edge under the header.

### 4. CRT Mode (`src/styles/global.css` + `src/layouts/Base.astro`)
When `?crt` query param is present on any page, an inline script adds `nx-fringe-mode` class to `<body>`. CSS applies a VHS/CRT-style effect: hue-rotate, saturation boost, scrolling scanline overlay, CRT vignette, chromatic aberration on text and images (red/cyan text-shadow and drop-shadow), and horizontal jitter flicker. Dark mode has stronger chromatic aberration and deeper vignette.

### 5. First Episode Anniversary (`src/layouts/Base.astro`)
During the week of November 10-16 (around ATN #1's air date of 2011-11-13), a hidden `<span>` next to the logo text becomes visible showing a party popper emoji and "Est. 2011". Uses a simple inline script checking month and date range.

## Other Changes

- **EpisodeCard border fix** (`src/components/EpisodeCard.astro`): Removed redundant `border-b`, `border-gray-100`, and `shadow-sm` from episode cards — parent containers already use `divide-y` for dividers. Fixes inconsistent card borders visible in light mode.

## Files Modified

- `src/pages/404.astro` — Themed fake episode 404 page
- `src/layouts/Base.astro` — Console info, CRT mode script, anniversary element + script
- `src/styles/global.css` — CRT mode CSS (flicker, hue-rotate, scanlines, chromatic aberration, vignette)
- `src/pages/index.astro` — Total listen time calculation, full-bleed hero section
- `src/components/EpisodeCard.astro` — Removed redundant border/shadow styles
- `.dev/plans/plan16.md` — This plan file
