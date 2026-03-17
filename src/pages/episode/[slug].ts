import type { APIRoute } from "astro";
import { getEpisodeBySlug } from "../../data";
import { normalizeSlug } from "../../data/slugs";
import { notFoundResponse } from "../../data/not-found";

export const GET: APIRoute = ({ params, redirect }) => {
  const slug = normalizeSlug(params.slug ?? "");
  if (slug && getEpisodeBySlug(slug)) {
    return redirect(`/episodes/${slug}/`, 301);
  }
  return notFoundResponse();
};
