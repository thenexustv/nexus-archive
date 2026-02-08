# Plan 9: README, Favicons, and Site Polish

- **Date:** 2026-02-08
- **Status:** done

## Changes Made

### README.md
- Created project README covering architecture, data layer, pages, components, styling, testing, and project structure.

### Favicon and Web Assets
- Replaced default Astro rocket `favicon.svg` and placeholder `favicon.ico` with the real NX branding.
- `favicon.ico` — downloaded from the live thenexus.tv site (16x16, original NX icon).
- `apple-touch-icon.png` — 180x180 PNG generated from the original NX color logo.
- `icon-192.png` / `icon-512.png` — PWA-size icons from the same source.
- `site.webmanifest` — web app manifest referencing the icon assets.
- Updated `Base.astro` `<head>` with proper `<link>` tags for ico, png icon, apple-touch-icon, and manifest.

### Contact Page and Navigation
- Added Contact link to the navbar header (already existed in footer).
- Obfuscated email on contact page: `ryan [at] rampersad [dot] com` with `[at]` and `[dot]` wrapped in `select-none`.
- Moved contact sentence from "About This Archive" section into its own "Contact" heading on the about page.
