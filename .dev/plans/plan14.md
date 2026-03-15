# Plan 14: RSS Podcast Feeds with Tombstone Entry

- **Date**: 2026-02-08
- **Status**: done

## Summary

Recreate RSS podcast feeds for each series so that podcast apps with old subscriptions get valid XML instead of errors. Each feed includes a tombstone entry at the top indicating the podcast is archived, followed by all episodes with iTunes podcast extensions and MP3 enclosures.

## Changes

### `src/pages/series/[slug]/feed.xml.ts` (new)

Static RSS endpoint for each series at `/series/{slug}/feed.xml`. Uses `getStaticPaths()` to generate all 13 series feeds at build time.

- Channel metadata: title, link, description, language, lastBuildDate, atom:link, iTunes fields
- Tombstone item first: "{Series Name} has been archived" with no enclosure
- Episode items: formattedTitle, guid, pubDate (RFC 2822), description, content:encoded (CDATA), enclosure (if media), itunes:duration, itunes:author

### `src/middleware.ts` (modified)

Added redirect from old WordPress feed URLs:
- `/category/{slug}/feed` or `/category/{slug}/feed/` -> `/series/{slug}/feed.xml` (301)

## Feed URL mapping

| Old URL | New URL |
|---------|---------|
| `/category/atn/feed/` | `/series/atn/feed.xml` |
| `/category/tf/feed/` | `/series/tf/feed.xml` |
| (all other series) | (same pattern) |
