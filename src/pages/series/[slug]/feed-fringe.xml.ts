import type { APIRoute, GetStaticPaths } from "astro";
import {
  getAllSeries,
  getEpisodesBySeries,
  getEpisodeBySlug,
} from "../../../data";
import type { Episode } from "../../../data/types";

const SITE = "https://thenexus.tv";

function escapeXml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdataWrap(html: string | null | undefined): string {
  if (!html) return "<![CDATA[]]>";
  return `<![CDATA[${html.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function toRFC2822(dateStr: string): string {
  return new Date(dateStr).toUTCString();
}

function formatDuration(length: string): string {
  return length;
}

function buildEpisodeItem(ep: Episode): string {
  const link = `${SITE}/episodes/${ep.slug}/`;
  const hosts = ep.people
    .filter((p) => p.role === "host")
    .map((p) => p.name)
    .join(", ");

  let item = `    <item>
      <title>${escapeXml(ep.formattedTitle)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRFC2822(ep.createdAt)}</pubDate>
      <description>${escapeXml(ep.description)}</description>
      <content:encoded>${cdataWrap(ep.content)}</content:encoded>`;

  if (ep.media) {
    item += `
      <enclosure url="${escapeXml(ep.media.url)}" length="${escapeXml(ep.media.size)}" type="audio/mpeg" />
      <itunes:duration>${escapeXml(formatDuration(ep.media.length))}</itunes:duration>`;
  }

  if (hosts) {
    item += `
      <itunes:author>${escapeXml(hosts)}</itunes:author>`;
  }

  item += `
    </item>`;

  return item;
}

export const getStaticPaths: GetStaticPaths = () => {
  return getAllSeries().map((series) => ({
    params: { slug: series.slug },
    props: { series },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { series } = props;
  const episodes = getEpisodesBySeries(series.slug);
  const feedUrl = `${SITE}/series/${series.slug}/feed-fringe.xml`;
  const seriesLink = `${SITE}/series/${series.slug}/`;

  // Collect fringe episodes from other series
  const seen = new Set(episodes.map((ep) => ep.slug));
  const fringeEpisodes: Episode[] = [];
  for (const ep of episodes) {
    if (ep.fringeSlug && !seen.has(ep.fringeSlug)) {
      const fringe = getEpisodeBySlug(ep.fringeSlug);
      if (fringe) {
        seen.add(fringe.slug);
        fringeEpisodes.push(fringe);
      }
    }
  }

  // Merge and sort newest-first
  const allEpisodes = [...episodes, ...fringeEpisodes].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const lastEpDate =
    allEpisodes.length > 0
      ? allEpisodes[0].createdAt
      : series.lastEpisodeDate;
  const lastBuildDate = lastEpDate
    ? toRFC2822(lastEpDate)
    : toRFC2822(new Date().toISOString());

  const tombstone = `    <item>
      <title>${escapeXml(`${series.name} has been archived`)}</title>
      <link>${seriesLink}</link>
      <guid isPermaLink="false">tombstone-${series.slug}</guid>
      <pubDate>${lastBuildDate}</pubDate>
      <description>${escapeXml(`${series.name} is no longer active. The complete archive of all episodes is preserved at thenexus.tv.`)}</description>
    </item>`;

  const episodeItems = allEpisodes.map(buildEpisodeItem).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${escapeXml(`${series.name} (with Fringe)`)}</title>
    <link>${seriesLink}</link>
    <description>${escapeXml(series.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <itunes:author>The Nexus</itunes:author>
    <itunes:owner>
      <itunes:name>The Nexus</itunes:name>
    </itunes:owner>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Technology" />
${tombstone}
${episodeItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
