# Plan 2: Refine Astro Site Based on WP Reference Analysis

- **Date**: 2026-02-07
- **Status**: done

## Summary

After reviewing the original `nexus-core` WP plugin and `coprime` theme, 10 gaps were identified and implemented. Additional pages (about, licenses, contact) were added with content sourced from the original WordPress site.

## Changes Implemented

### 1. Formatted episode titles — done
- Added `formattedTitle` field to Episode type (`Series #Number: Title`)
- Used in `<title>` tags and EpisodeCard display

### 2. Previous/next navigation within series — done
- Added `getEpisodeNeighbors(slug)` returning prev (older) and next (newer) within same series
- Rendered as Older/Newer links at bottom of episode detail pages

### 3. Gravatar avatars — done
- MD5-based Gravatar URL generation from email addresses using `node:crypto`
- 48px avatars on PersonCard, 80px on person detail page

### 4. Upgrade audio URLs to HTTPS — done
- `http://` → `https://` rewrite on media URLs in `resolveEpisode`

### 5. External links open in new tabs — done
- `processContent()` function adds `target="_blank" rel="noopener noreferrer"` to external links in show notes HTML

### 6. Custom 404 page — done
- Styled 404 page with links to homepage and episodes

### 7. Open Graph meta tags — done
- Added `og:title`, `og:description`, `og:type`, `og:url` to Base layout
- Episode pages pass `ogType="article"`, all others default to `"website"`

### 8. Bio preview on PersonCard — done
- HTML-stripped, truncated to ~120 chars with ellipsis on people list cards

### 9. Series date ranges + archived status — done
- Computed `firstEpisodeDate` and `lastEpisodeDate` per series
- Amber "Archived" badge and year range on series list and series detail pages

### 10. Homepage refinement — done
- Added tagline "Podcasts from the Technological Convergence"
- Network mission statement from original WP site
- Stats bar (episodes, series, people, year range)
- Archive notice with link to about page

### 11. About page — done
- Network description, history (founded Nov 13 2011), shows listing, people stats, locations
- Archive technical details demoted to plain subsection at bottom

### 12. Licenses page — done
- Per-show Creative Commons / Public Domain licenses from original WP site
- Software projects (Nexus Core, Coprime) with MIT licenses

### 13. Contact page — done
- Archive notice explaining network is no longer active
- Email displayed with `[at]` obfuscation, split into user/domain variables in frontmatter

### 14. Navigation & footer updates — done
- Added About, Licenses, Contact to footer
- Added Licenses and About to nav bar

## Build Result

- 1545 pages built in ~3-7s
- Zero errors
