import rawData from "../../export/nexus-export-1770519097.json";
import type {
  RawExport,
  Series,
  Episode,
  Person,
  EpisodePerson,
  PersonEpisode,
  EpisodeMedia,
} from "./types";

const data = rawData as RawExport;

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeEpisodeSlug(seriesSlug: string, number: string): string {
  return `${seriesSlug}-${number}`;
}

// --- Build lookup maps ---

const seriesById = new Map(data.series.map((s) => [s.id, s]));

const episodeById = new Map(data.episodes.map((e) => [e.id, e]));

const mediaByEpisodeId = new Map(
  data.episode_medias.map((m) => [m.episode_id, m]),
);

// People relations grouped by episode
const peopleRelsByEpisode = new Map<
  number,
  { person_id: number; role: "host" | "guest" }[]
>();
for (const rel of data.people_relations) {
  const list = peopleRelsByEpisode.get(rel.episode_id) ?? [];
  list.push({ person_id: rel.person_id, role: rel.role });
  peopleRelsByEpisode.set(rel.episode_id, list);
}

// People relations grouped by person
const episodeRelsByPerson = new Map<
  number,
  { episode_id: number; role: "host" | "guest" }[]
>();
for (const rel of data.people_relations) {
  const list = episodeRelsByPerson.get(rel.person_id) ?? [];
  list.push({ episode_id: rel.episode_id, role: rel.role });
  episodeRelsByPerson.set(rel.person_id, list);
}

// Fringe and parent maps (episode_id -> related slug)
const fringeMap = new Map<number, string>();
const parentMap = new Map<number, string>();
for (const rel of data.episode_relations) {
  const related = episodeById.get(rel.episode_related_id);
  if (!related) continue;
  const relatedSeries = seriesById.get(related.series_id);
  if (!relatedSeries) continue;
  const relatedSlug = makeEpisodeSlug(relatedSeries.slug, related.number);

  if (rel.type === "fringe") {
    fringeMap.set(rel.episode_id, relatedSlug);
  } else if (rel.type === "parent") {
    parentMap.set(rel.episode_id, relatedSlug);
  }
}

// Person slug map
const personSlugById = new Map(
  data.people.map((p) => [p.id, slugifyName(p.name)]),
);

// Determine global role for each person (host if they've ever hosted, otherwise guest)
const personGlobalRole = new Map<number, "host" | "guest">();
for (const person of data.people) {
  const rels = episodeRelsByPerson.get(person.id) ?? [];
  const hasHosted = rels.some((r) => r.role === "host");
  personGlobalRole.set(person.id, hasHosted ? "host" : "guest");
}

// Episode counts per series
const episodeCountBySeries = new Map<number, number>();
for (const ep of data.episodes) {
  episodeCountBySeries.set(
    ep.series_id,
    (episodeCountBySeries.get(ep.series_id) ?? 0) + 1,
  );
}

// --- Resolved data ---

export function getAllSeries(): Series[] {
  return data.series
    .filter((s) => (episodeCountBySeries.get(s.id) ?? 0) > 0)
    .map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      episodeCount: episodeCountBySeries.get(s.id) ?? 0,
    }))
    .sort((a, b) => b.episodeCount - a.episodeCount);
}

export function getSeriesBySlug(slug: string): Series | undefined {
  const raw = data.series.find((s) => s.slug === slug);
  if (!raw) return undefined;
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    episodeCount: episodeCountBySeries.get(raw.id) ?? 0,
  };
}

function resolveEpisode(raw: (typeof data.episodes)[0]): Episode {
  const series = seriesById.get(raw.series_id)!;
  const slug = makeEpisodeSlug(series.slug, raw.number);
  const rawMedia = mediaByEpisodeId.get(raw.id);
  const media: EpisodeMedia | null = rawMedia
    ? {
        type: rawMedia.type,
        length: rawMedia.length,
        size: rawMedia.size,
        url: rawMedia.url,
      }
    : null;

  const peopleRels = peopleRelsByEpisode.get(raw.id) ?? [];
  const people: EpisodePerson[] = peopleRels
    .map((rel) => {
      const person = data.people.find((p) => p.id === rel.person_id);
      if (!person) return null;
      return {
        id: person.id,
        name: person.name,
        slug: personSlugById.get(person.id)!,
        role: rel.role,
      };
    })
    .filter((p): p is EpisodePerson => p !== null);

  return {
    id: raw.id,
    name: raw.name,
    number: raw.number,
    slug,
    content: raw.content,
    description: raw.description,
    seriesId: raw.series_id,
    seriesSlug: series.slug,
    seriesName: series.name,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    media,
    people,
    fringeSlug: fringeMap.get(raw.id) ?? null,
    parentSlug: parentMap.get(raw.id) ?? null,
  };
}

// Cache resolved episodes
let _allEpisodes: Episode[] | null = null;

export function getAllEpisodes(): Episode[] {
  if (!_allEpisodes) {
    _allEpisodes = data.episodes
      .map(resolveEpisode)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
  return _allEpisodes;
}

export function getEpisodeBySlug(slug: string): Episode | undefined {
  return getAllEpisodes().find((e) => e.slug === slug);
}

export function getEpisodesBySeries(seriesSlug: string): Episode[] {
  return getAllEpisodes().filter((e) => e.seriesSlug === seriesSlug);
}

export function getAllPeople(): Person[] {
  return data.people
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: personSlugById.get(p.id)!,
      content: p.content,
      globalRole: personGlobalRole.get(p.id) ?? ("guest" as const),
      episodeCount: (episodeRelsByPerson.get(p.id) ?? []).length,
    }))
    .sort((a, b) => b.episodeCount - a.episodeCount);
}

export function getPersonBySlug(slug: string): Person | undefined {
  return getAllPeople().find((p) => p.slug === slug);
}

export function getEpisodesByPerson(personSlug: string): PersonEpisode[] {
  const person = data.people.find(
    (p) => personSlugById.get(p.id) === personSlug,
  );
  if (!person) return [];

  const rels = episodeRelsByPerson.get(person.id) ?? [];
  return rels
    .map((rel) => {
      const ep = episodeById.get(rel.episode_id);
      if (!ep) return null;
      const series = seriesById.get(ep.series_id)!;
      return {
        id: ep.id,
        name: ep.name,
        slug: makeEpisodeSlug(series.slug, ep.number),
        number: ep.number,
        seriesName: series.name,
        seriesSlug: series.slug,
        role: rel.role,
        createdAt: ep.created_at,
      };
    })
    .filter((e): e is PersonEpisode => e !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export const SITE_TITLE = "thenexus.tv";
export const EPISODES_PER_PAGE = 50;
