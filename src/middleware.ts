import { defineMiddleware } from "astro:middleware";
import { getAllSeries, getEpisodeBySlug } from "./data";
import { normalizeSlug } from "./data/slugs";

const seriesSlugs = getAllSeries().map((s) => s.slug);

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

  // /category/{slug}/feed → /series/{slug}/feed.xml or feed-fringe.xml
  const feedMatch = pathname.match(/^\/category\/([^/]+)\/feed\/?$/);
  if (feedMatch) {
    const slug = feedMatch[1];
    if (seriesSlugs.includes(slug)) {
      if (context.url.searchParams.has("fringe")) {
        return context.redirect(`/series/${slug}/feed-fringe.xml`, 301);
      }
      return context.redirect(`/series/${slug}/feed.xml`, 301);
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
