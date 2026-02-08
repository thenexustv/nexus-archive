import { describe, it, expect } from "vitest";
import {
  slugifyName,
  makeEpisodeSlug,
  gravatarUrl,
  processContent,
  getAllSeries,
  getSeriesBySlug,
  getAllEpisodes,
  getEpisodeBySlug,
  getAllPeople,
  SITE_TITLE,
  EPISODES_PER_PAGE,
} from "./index";

describe("slugifyName", () => {
  it("lowercases and converts spaces to hyphens", () => {
    expect(slugifyName("Ryan Rampersad")).toBe("ryan-rampersad");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugifyName("O'Brien-Smith")).toBe("o-brien-smith");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyName("--hello--")).toBe("hello");
  });

  it("collapses multiple non-alphanumeric chars into a single hyphen", () => {
    expect(slugifyName("foo   bar")).toBe("foo-bar");
  });
});

describe("makeEpisodeSlug", () => {
  it("concatenates series slug and number", () => {
    expect(makeEpisodeSlug("atn", "1")).toBe("atn1");
  });

  it("works with multi-digit numbers", () => {
    expect(makeEpisodeSlug("tf", "130")).toBe("tf130");
  });
});

describe("gravatarUrl", () => {
  it("returns null for undefined email", () => {
    expect(gravatarUrl(undefined)).toBeNull();
  });

  it("returns null for empty string email", () => {
    expect(gravatarUrl("")).toBeNull();
  });

  it("returns gravatar URL with md5 hash", () => {
    const url = gravatarUrl("test@example.com");
    expect(url).toMatch(/^https:\/\/www\.gravatar\.com\/avatar\/[a-f0-9]{32}\?s=160&d=mp$/);
  });

  it("normalizes case and whitespace", () => {
    const url1 = gravatarUrl("Test@Example.com");
    const url2 = gravatarUrl("  test@example.com  ");
    expect(url1).toBe(url2);
  });
});

describe("processContent", () => {
  it("adds target=_blank to external links", () => {
    const input = '<a href="https://example.com">link</a>';
    const result = processContent(input);
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it("skips links that already have a target", () => {
    const input = '<a href="https://example.com" target="_self">link</a>';
    const result = processContent(input);
    expect(result).toBe(input);
  });

  it("skips relative links", () => {
    const input = '<a href="/about">link</a>';
    const result = processContent(input);
    expect(result).toBe(input);
  });

  it("handles multiple links in one string", () => {
    const input =
      '<a href="https://a.com">A</a> and <a href="https://b.com">B</a>';
    const result = processContent(input);
    expect(result.match(/target="_blank"/g)?.length).toBe(2);
  });
});

describe("getAllSeries", () => {
  const series = getAllSeries();

  it("returns a non-empty array", () => {
    expect(series.length).toBeGreaterThan(0);
  });

  it("excludes zero-episode series", () => {
    for (const s of series) {
      expect(s.episodeCount).toBeGreaterThan(0);
    }
  });

  it("is sorted alphabetically by name", () => {
    for (let i = 1; i < series.length; i++) {
      expect(series[i - 1].name.localeCompare(series[i].name)).toBeLessThanOrEqual(0);
    }
  });
});

describe("getSeriesBySlug", () => {
  it("finds a known series", () => {
    const atn = getSeriesBySlug("atn");
    expect(atn).toBeDefined();
    expect(atn!.name).toBe("At The Nexus");
  });

  it("returns undefined for nonexistent slug", () => {
    expect(getSeriesBySlug("nonexistent-series")).toBeUndefined();
  });
});

describe("getAllEpisodes", () => {
  const episodes = getAllEpisodes();

  it("returns a non-empty array", () => {
    expect(episodes.length).toBeGreaterThan(0);
  });

  it("is sorted newest-first", () => {
    for (let i = 1; i < episodes.length; i++) {
      expect(new Date(episodes[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(episodes[i].createdAt).getTime(),
      );
    }
  });

  it("each episode has a non-empty slug", () => {
    for (const ep of episodes) {
      expect(ep.slug).toBeTruthy();
    }
  });
});

describe("getEpisodeBySlug", () => {
  it("finds a known episode", () => {
    const ep = getEpisodeBySlug("atn1");
    expect(ep).toBeDefined();
    expect(ep!.seriesSlug).toBe("atn");
  });

  it("returns undefined for nonexistent slug", () => {
    expect(getEpisodeBySlug("nonexistent-episode-999")).toBeUndefined();
  });
});

describe("getAllPeople", () => {
  const people = getAllPeople();

  it("returns a non-empty array", () => {
    expect(people.length).toBeGreaterThan(0);
  });

  it("is sorted by episode count descending", () => {
    for (let i = 1; i < people.length; i++) {
      expect(people[i - 1].episodeCount).toBeGreaterThanOrEqual(people[i].episodeCount);
    }
  });
});

describe("constants", () => {
  it("SITE_TITLE is thenexus.tv", () => {
    expect(SITE_TITLE).toBe("thenexus.tv");
  });

  it("EPISODES_PER_PAGE is 50", () => {
    expect(EPISODES_PER_PAGE).toBe(50);
  });
});
