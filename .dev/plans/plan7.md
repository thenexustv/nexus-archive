# Plan 7: Footer Redesign & Easter Eggs

- **Date:** 2026-02-07
- **Status:** done

## Summary

Redesigned the footer to match the original thenexus.tv Coprime theme layout and added several easter eggs as nods to the original site.

## Changes

### Footer Redesign (`src/layouts/Base.astro`)
- Centered layout with `text-center` and `justify-center` nav links
- Copyright line: `© {year} ■ The Nexus` replicating the original pattern
- `data-year` span with client-side JS to keep the copyright year current
- Removed tagline (not present in the original footer)
- Added blurred/faded 64x64 nexus logo at the bottom
- Increased padding to `py-8`

### Footer Logo Styles (`src/styles/global.css`)
- `.nx-footer-logo`: `opacity: 0.3`, `filter: blur(2px) grayscale(100%)` matching the original `.nx-end` treatment

### Print Easter Egg (`src/styles/global.css`)
- `@media print` rule hides all page content and displays "You cannot print podcasts!" centered on the page

### Space-Themed Data Attributes (`src/layouts/Base.astro`)
- `data-universe` on `<body>`
- `data-villain` on `<header>`
- `data-galaxy` on `<main>`
- `data-hero` on `<footer>`
- Nods to the original Coprime theme's space-themed layout IDs (`#universe`, `#galaxy`, etc.)

### ASCII Art Banner (`src/layouts/Base.astro`)
- Restored the original "THE NEXUS" ASCII art HTML comment in `<head>`, with updated credit line referencing the archive

### Homepage Updates (`src/pages/index.astro`)
- `<h1>` styled with `font-league text-5xl uppercase tracking-wide` to match header treatment
- `.tv` hidden with `sr-only` class
- Description paragraph updated to past tense

## Files Modified
- `src/layouts/Base.astro`
- `src/styles/global.css`
- `src/pages/index.astro`
