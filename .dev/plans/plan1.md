# Plan 1: Convert thenexus.tv from WordPress to Static Astro Site

- **Date**: 2026-02-07
- **Status**: done

## Summary

Convert thenexus.tv (~1384 episodes, 13 series, 92 people) from WordPress to a static archive built with Astro + TailwindCSS + React.

## Phases

### Phase 1: Project Setup — done
- Initialized Astro project with `pnpm create astro@latest`
- Added integrations: TailwindCSS (v4), React, Typography plugin
- Added dependencies: date-fns
- Configured static output

### Phase 2: Data Layer — done
- Analyzed JSON export structure: series, episodes, episode_relations, episode_medias, people, people_relations
- Built `src/data/types.ts` with raw and resolved TypeScript types
- Built `src/data/index.ts` with:
  - Slug generation: `{series_slug}-{number}` for episodes, slugified name for people
  - Relationship resolution: series, people (per-episode role), fringe/parent links, media
  - Query functions: getAllEpisodes, getEpisodeBySlug, getEpisodesBySeries, getAllPeople, getPersonBySlug, getEpisodesByPerson, getAllSeries, getSeriesBySlug
  - In-memory caching of resolved episodes

### Phase 3: Layout & Components — done
- Base layout with nav (Home, Episodes, Series, People) and footer
- EpisodeCard: title, series badge, date, duration, description excerpt
- PersonCard: name, episode count
- Pagination: page numbers with ellipsis, prev/next

### Phase 4: Pages — done
- Homepage: recent 10 episodes, all series grid
- Episodes list: paginated (50/page) with rest param route
- Episode detail: audio player, show notes (HTML), hosts/guests links, series link, fringe/parent links
- Series list: all series with descriptions and episode counts
- Series detail: paginated episode list (rest param route for pagination)
- People list: split into hosts and guests sections
- Person detail: bio, hosted episodes, guest appearances

### Phase 5: Interlinking — done
- Episode ↔ Fringe/Parent bidirectional links
- Episode → People (hosts/guests) with links to person pages
- People → Episodes with role indicator and date
- Episode → Series badge link
- Series → Episodes listing
- HTML show notes rendered with `set:html`

### Phase 6: Styling — done
- TailwindCSS throughout with typography plugin for prose content
- Responsive layout
- Image placeholders structured for future addition

### Phase 7: Build Verification — done
- 1541 pages built in ~7 seconds
- 13MB static output
- All page types render correctly

## Key Decisions
- Single JSON import rather than content collections (simpler for fully-linked data)
- Episode slugs: `{series_slug}-{number}` (no duplicates confirmed)
- Person slugs: slugified name (no duplicates confirmed)
- 50 episodes per page for pagination
- Rest param routes (`[...slug]`) for series detail to support pagination paths like `/series/tf/2/`
