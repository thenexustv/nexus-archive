import { describe, it, expect } from "vitest";
import { parseDuration, formatTime } from "./AudioPlayer";

describe("parseDuration", () => {
  it("returns 0 for null", () => {
    expect(parseDuration(null)).toBe(0);
  });

  it("returns 0 for empty string", () => {
    expect(parseDuration("")).toBe(0);
  });

  it("parses h:mm:ss format", () => {
    expect(parseDuration("1:30:00")).toBe(5400);
  });

  it("parses mm:ss format", () => {
    expect(parseDuration("45:30")).toBe(2730);
  });

  it("parses seconds-only format", () => {
    expect(parseDuration("90")).toBe(90);
  });
});

describe("formatTime", () => {
  it("formats seconds under a minute", () => {
    expect(formatTime(5)).toBe("0:05");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(65)).toBe("1:05");
  });

  it("formats zero", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(formatTime(3661)).toBe("1:01:01");
  });

  it("floors fractional seconds", () => {
    expect(formatTime(65.9)).toBe("1:05");
  });
});
