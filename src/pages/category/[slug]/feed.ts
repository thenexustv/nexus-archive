import type { APIRoute } from "astro";
import { getAllSeries } from "../../../data";

const seriesSlugs = getAllSeries().map((s) => s.slug);

export const GET: APIRoute = ({ params, url, redirect }) => {
  const slug = params.slug ?? "";
  if (seriesSlugs.includes(slug)) {
    if (url.searchParams.has("fringe")) {
      return redirect(`/series/${slug}/feed-fringe.xml`, 301);
    }
    return redirect(`/series/${slug}/feed.xml`, 301);
  }
  return new Response("Not found", { status: 404 });
};
