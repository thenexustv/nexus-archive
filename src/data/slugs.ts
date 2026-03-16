import { getAllSeries } from "./index";

const seriesSlugs = getAllSeries()
  .map((s) => s.slug)
  .sort((a, b) => b.length - a.length);

/**
 * Normalize an old-style slug to the canonical dashless format (e.g. "atn123").
 * Handles both dashed ("atn-123") and dashless ("atn123") inputs.
 */
export function normalizeSlug(raw: string): string | null {
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
