import type { APIRoute } from "astro";
import { getAllSeries, getEpisodeBySlug } from "../../data";
import { normalizeSlug } from "../../data/slugs";

export const GET: APIRoute = ({ params, redirect }) => {
  const slug = normalizeSlug(params.slug ?? "");
  if (slug && getEpisodeBySlug(slug)) {
    return redirect(`/episodes/${slug}/`, 301);
  }
  return redirect("/404", 302);
};
