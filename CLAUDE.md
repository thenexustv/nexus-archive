# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

nexus-simple — a static archive of thenexus.tv, a podcast network with ~1384 episodes across 13 series. Built with Astro, TailwindCSS, and React. Data sourced from a JSON export at `export/nexus-export-1770519097.json`.

## Commands

- `pnpm dev` — Start local dev server
- `pnpm build` — Build static site to `dist/`
- `pnpm preview` — Preview the built site
- `pnpm astro check` — Type check

## Architecture

- **Data layer** (`src/data/`): Loads the JSON export, resolves all relationships, exports typed helper functions. No content collections — all data is in-memory from a single JSON import.
- **Episode slugs**: `{series_slug}-{number}` (e.g., `atn-1`, `tf-130`)
- **Person slugs**: Derived from name (e.g., `ryan-rampersad`)
- **Episode relations**: `fringe` (main episode links to its fringe) and `parent` (fringe links back to main)
- **Pages**: Homepage, paginated episodes, episode detail, series list, series detail (paginated), people list, person detail

## Key Files

- `src/data/index.ts` — Data loading and query functions
- `src/data/types.ts` — TypeScript types for raw export and resolved entities
- `src/layouts/Base.astro` — Base HTML layout with nav and footer
- `src/components/` — EpisodeCard, PersonCard, Pagination
- `src/pages/` — All route pages

## Git Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/). Format: `type(scope): description`

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`

Examples:
- `feat(episodes): add search filtering`
- `fix(pagination): correct off-by-one on last page`
- `docs: update CLAUDE.md with deploy instructions`
- `chore: upgrade astro to v5.18`

## .dev Directory

- **`.dev/plans/`** — Plan files named `plan{number}.md`. Always create a plan file when planning work. Each plan must track:
  - Date
  - Status: `proposed`, `in progress`, or `done`
  - Reasoning, questions, refinements, examples, and any other relevant context
- **`.dev/kb/`** — Knowledge base files for interesting technical details.
- **`.dev/proposals/`** — Proposals that are not yet ready to be planned.
