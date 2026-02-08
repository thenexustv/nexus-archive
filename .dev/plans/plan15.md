# Plan 15: RSS Feed UI Links + Fringe Variant Feed

- **Date**: 2026-02-08
- **Status**: done

## Summary

Added fringe variant RSS feeds, visible feed links in the UI, HTML autodiscovery tags, middleware redirects for legacy fringe feed URLs, and iTunes/Apple Podcasts links for series pages.

## Changes

### New: `src/pages/series/[slug]/feed-fringe.xml.ts`
- Fringe variant feed that includes both series episodes and their related fringe episodes
- Channel title uses `{Series Name} (with Fringe)` to distinguish from the main feed
- Resolves fringe slugs via `getEpisodeBySlug()`, dedupes by slug, sorts newest-first
- Same tombstone entry and XML structure as the main feed

### Modified: `src/data/types.ts`
- Added `itunesUrl: string | null` to the `Series` interface

### Modified: `src/data/index.ts`
- Added `itunesUrlBySlug` map with 9 iTunes/Apple Podcasts URLs scraped from thenexus.tv/shows/
- Wired into `getAllSeries()` and `getSeriesBySlug()`

### Modified: `src/pages/series/[...slug].astro`
- Added "Feed", "Feed + Fringe", and "iTunes" links in the series detail page header after the Archived badge
- Each link has a Heroicons mini SVG icon (RSS icon for feeds, arrow-top-right-on-square for iTunes)
- Feed links hover orange, iTunes hovers purple
- iTunes link only shown for series that have one (9 of 11)
- Passes both feeds to Base layout for autodiscovery `<link>` tags

### Modified: `src/pages/series/index.astro`
- Changed card wrapper from `<a>` to `<div>` to avoid invalid nested `<a>` elements (browsers auto-close the parent anchor, pushing feed links outside the card as separate grid items)
- Series name is now the only `<a>` link in the card header
- Added "Feed", "Feed + Fringe", and "iTunes" links at the bottom of each series card
- Same icon and color treatment as the series detail page

### Modified: `src/layouts/Base.astro`
- Added optional `feeds` prop (`{ title, url }[]`)
- Renders `<link rel="alternate" type="application/rss+xml">` tags in `<head>` when feeds are provided

### Modified: `src/middleware.ts`
- Added fringe query parameter check to the existing `/category/{slug}/feed/` redirect
- `/category/{slug}/feed/?fringe` now redirects 301 to `/series/{slug}/feed-fringe.xml`
- Plain `/category/{slug}/feed/` continues to redirect to `/series/{slug}/feed.xml`

## Feed URL Mapping

| Old URL | New URL |
|---------|---------|
| `/category/{slug}/feed/` | `/series/{slug}/feed.xml` |
| `/category/{slug}/feed/?fringe` | `/series/{slug}/feed-fringe.xml` |

## Notes

### GUIDs and podcast client notifications
The old WordPress feeds used `isPermaLink="false"` GUIDs with WordPress query strings (e.g., `https://thenexus.tv/?post_type=episode&p=6111`). The new feeds use episode permalink URLs as GUIDs (e.g., `https://thenexus.tv/episodes/pk66/`). Since the original WordPress post IDs are not present in the data export, we cannot reconstruct the old GUIDs. This means existing subscribers will see all episodes as new items — there is no way to suppress notifications without the original post IDs.
