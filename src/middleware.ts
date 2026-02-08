import { defineMiddleware } from "astro:middleware";
import { getAllSeries, getEpisodeBySlug } from "./data";

// Build a set of known series slugs, sorted longest-first for prefix matching
const seriesSlugs = getAllSeries()
  .map((s) => s.slug)
  .sort((a, b) => b.length - a.length);

/**
 * Normalize an old-style slug to the canonical dashless format (e.g. "atn123").
 * Handles both dashed ("atn-123") and dashless ("atn123") inputs.
 */
function normalizeSlug(raw: string): string | null {
  // Dashed format (e.g. "atn-123") → strip the dash
  const dashMatch = raw.match(/^([a-z]+)-(\d+)$/);
  if (dashMatch) {
    return `${dashMatch[1]}${dashMatch[2]}`;
  }

  // Dashless format (e.g. "atn123") → validate against known series prefixes
  for (const prefix of seriesSlugs) {
    if (raw.startsWith(prefix)) {
      const number = raw.slice(prefix.length);
      if (number && /^\d+$/.test(number)) {
        return raw; // already in canonical format
      }
    }
  }
  return null;
}

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  // /episode/ (singular list) → /episodes/
  if (pathname === "/episode" || pathname === "/episode/") {
    return context.redirect("/episodes/", 301);
  }

  // /episode/{slug} → /episodes/{slug}/
  const episodeMatch = pathname.match(/^\/episode\/([^/]+)\/?$/);
  if (episodeMatch) {
    const slug = normalizeSlug(episodeMatch[1]);
    if (slug && getEpisodeBySlug(slug)) {
      return context.redirect(`/episodes/${slug}/`, 301);
    }
  }

  // Root-level /{slug} (e.g. /atn123) → /episodes/{slug}/
  const rootMatch = pathname.match(/^\/([a-z]+\d+)\/?$/);
  if (rootMatch) {
    const slug = normalizeSlug(rootMatch[1]);
    if (slug && getEpisodeBySlug(slug)) {
      return context.redirect(`/episodes/${slug}/`, 301);
    }
  }

  return next();
});
