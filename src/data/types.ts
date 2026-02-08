export interface RawSeries {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface RawEpisode {
  id: number;
  name: string;
  number: string;
  content: string;
  description: string;
  series_id: number;
  created_at: string;
  updated_at: string;
}

export interface RawEpisodeRelation {
  type: "fringe" | "parent";
  episode_id: number;
  episode_related_id: number;
}

export interface RawEpisodeMedia {
  type: string;
  episode_id: number;
  length: string;
  size: string;
  url: string;
}

export interface RawPerson {
  id: number;
  name: string;
  content: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface RawPersonRelation {
  role: "host" | "guest";
  person_id: number;
  episode_id: number;
}

export interface RawExport {
  series: RawSeries[];
  episodes: RawEpisode[];
  episode_relations: RawEpisodeRelation[];
  episode_medias: RawEpisodeMedia[];
  people: RawPerson[];
  people_relations: RawPersonRelation[];
}

// Resolved types used by the site

export interface Series {
  id: number;
  name: string;
  slug: string;
  description: string;
  episodeCount: number;
  firstEpisodeDate: string | null;
  lastEpisodeDate: string | null;
}

export interface EpisodeMedia {
  type: string;
  length: string;
  size: string;
  url: string;
}

export interface EpisodePerson {
  id: number;
  name: string;
  slug: string;
  role: "host" | "guest";
}

export interface Episode {
  id: number;
  name: string;
  formattedTitle: string;
  number: string;
  slug: string;
  content: string;
  description: string;
  seriesId: number;
  seriesSlug: string;
  seriesName: string;
  createdAt: string;
  updatedAt: string;
  media: EpisodeMedia | null;
  people: EpisodePerson[];
  fringeSlug: string | null;
  parentSlug: string | null;
}

export interface EpisodeNeighbor {
  slug: string;
  name: string;
  number: string;
}

export interface Person {
  id: number;
  name: string;
  slug: string;
  content: string;
  gravatarUrl: string | null;
  globalRole: "host" | "guest";
  episodeCount: number;
}

export interface PersonEpisode {
  id: number;
  name: string;
  slug: string;
  number: string;
  seriesName: string;
  seriesSlug: string;
  role: "host" | "guest";
  createdAt: string;
}
