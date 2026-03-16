# nexus-archive

A static archive of [thenexus.tv](https://thenexus.tv), a podcast network that produced 1,384+ episodes across 13 series between 2011 and 2022. Built with Astro, TailwindCSS, and React.

The original site ran on WordPress with the [Nexus Core](https://github.com/thenexustv/nexus-core) plugin and [Coprime](https://github.com/thenexustv/coprime) theme. This project replaces it with a fully static site generated from a JSON data export.

## Getting Started

```bash
pnpm install
pnpm dev        # Start dev server
pnpm build      # Build static site to dist/
pnpm preview    # Preview the built site
pnpm test       # Run tests
```

## Hosting

The site runs as a standalone Node server using the `@astrojs/node` adapter, deployed in a Podman container.

### Why `output: 'server'` instead of `output: 'static'`

Astro is configured with `output: 'server'` even though every page is prerendered as static HTML (`export const prerender = true` in each page file). This is intentional.

With `output: 'static'`, the node adapter acts as a plain static file server. Requests that don't match a prebuilt file (e.g., `/episode/ted20/`) are 404'd immediately — Astro middleware **never runs at request time** in static mode. It only runs during the build. This is a significant and poorly documented limitation of the Astro node standalone adapter.

By using `output: 'server'` with prerendered pages, we get the best of both worlds:
- **Pages are still prebuilt as static HTML** at build time (same performance as static mode)
- **Middleware runs at request time** for any path that doesn't match a static file, enabling redirects from old WordPress URLs

This matters because the original WordPress site used `/episode/ted20` (singular) while the archive uses `/episodes/ted20/` (plural). The middleware in `src/middleware.ts` handles these redirects so old links, bookmarks, and search engine results continue to work.

### Redirect routes handled by middleware

| Old URL | Redirects to |
|---|---|
| `/episode/{slug}` | `/episodes/{slug}/` (with slug normalization) |
| `/episode/` | `/episodes/` |
| `/{slug}` (e.g., `/ted20`) | `/episodes/{slug}/` |
| `/category/{series}/feed` | `/series/{series}/feed.xml` |

Slug normalization converts dashed formats (`atn-1`) to the canonical dashless format (`atn1`).

### Running locally

```bash
pnpm build
node dist/server/entry.mjs
```

## Architecture

### Data Layer

All data comes from a single JSON export (`export/nexus-export-1770519097.json`, ~4.8 MB). There are no content collections or database connections — `src/data/index.ts` loads the JSON at build time, resolves all relationships between series, episodes, people, and media, then exports typed query functions like `getAllEpisodes()`, `getSeriesBySlug()`, and `getEpisodesByPerson()`.

Episode slugs follow the format `{series_slug}{number}` (e.g., `atn1`, `tf130`). Person slugs are derived from names (e.g., `ryan-rampersad`). Episodes can have `fringe` (spin-off) and `parent` (back-link) relationships to other episodes.

### Pages

| Route | Description |
|---|---|
| `/` | Homepage with recent episodes, series grid, and network stats |
| `/episodes/` | Paginated episode listing (50 per page) |
| `/episodes/[slug]/` | Episode detail with audio player, people, and related episodes |
| `/series/` | All series directory |
| `/series/[slug]/` | Series detail with paginated episodes |
| `/people/` | People directory, separated into hosts and guests |
| `/people/[slug]/` | Person profile with episode history |
| `/about/` | Network history and archive information |
| `/contact/` | Contact page |
| `/licenses/` | Creative Commons license details |

See [Hosting](#hosting) for details on how middleware handles redirects from old WordPress-style URLs.

### Components

- **AudioPlayer.tsx** — React component with HTML5 audio playback, Web Audio API frequency visualization (with synthetic fallback for CORS-blocked sources), keyboard shortcuts, and a native player toggle. Client-side hydrated.
- **EpisodeCard.astro** — Episode card with series tag, date, duration, and description.
- **Pagination.astro** — Page navigation with smart range display and ellipsis.
- **PersonCard.astro** — Person card with Gravatar, role badge, and episode count.

### Styling

TailwindCSS v4 with the typography plugin. Full dark mode support. Custom League Gothic font for headings. The site uses a neutral gray/stone palette with blue accents.

## Testing

```bash
pnpm test           # Run once
pnpm test:watch     # Watch mode
```

Tests use [Vitest](https://vitest.dev/) and cover the data layer query functions and utility functions (`slugifyName`, `makeEpisodeSlug`, `gravatarUrl`, `processContent`, `parseDuration`, `formatTime`). Tests load the real JSON export — no mocks needed.

## Project Structure

```
src/
  components/     # Astro and React UI components
  data/           # Data loading, types, and query functions
  layouts/        # Base HTML layout
  pages/          # All route pages
  styles/         # Global CSS
export/           # Source JSON data export
public/           # Static assets (images, fonts, favicons)
.dev/             # Development plans and knowledge base
```
