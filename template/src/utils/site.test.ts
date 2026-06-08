import fs from "fs";
import {
  getRequestBaseUrl,
  getTopLevelRoutes,
  getRoutePriority,
  getChangeFreq,
} from "./site";

function makeHeaders(map: Record<string, string>) {
  return { get: (key: string) => map[key] ?? null };
}

jest.mock("fs");
const mockReaddirSync = fs.readdirSync as jest.MockedFunction<
  typeof fs.readdirSync
>;

function makeDirent(name: string, isDir: boolean) {
  return { name, isDirectory: () => isDir } as fs.Dirent;
}

describe("getRequestBaseUrl()", () => {
  it("uses x-forwarded-proto and host when present", () => {
    const h = makeHeaders({
      "x-forwarded-proto": "https",
      host: "example.com",
    });
    expect(getRequestBaseUrl(h as any)).toBe("https://example.com");
  });

  it("falls back to https and localhost:3000 when headers are missing", () => {
    const h = makeHeaders({});
    expect(getRequestBaseUrl(h as any)).toBe("https://localhost:3000");
  });

  it("uses http when x-forwarded-proto is http", () => {
    const h = makeHeaders({
      "x-forwarded-proto": "http",
      host: "localhost:3000",
    });
    expect(getRequestBaseUrl(h as any)).toBe("http://localhost:3000");
  });
});

describe("getTopLevelRoutes()", () => {
  it("always includes the root route", () => {
    mockReaddirSync.mockReturnValue([]);
    expect(getTopLevelRoutes()).toContain("/");
  });

  it("includes top-level directories as routes", () => {
    mockReaddirSync.mockReturnValue([
      makeDirent("about", true),
      makeDirent("blog", true),
    ] as any);
    expect(getTopLevelRoutes()).toEqual(["/", "/about", "/blog"]);
  });

  it("excludes api, sitemap.xml, and robots.txt directories", () => {
    mockReaddirSync.mockReturnValue([
      makeDirent("api", true),
      makeDirent("sitemap.xml", true),
      makeDirent("robots.txt", true),
      makeDirent("about", true),
    ] as any);
    expect(getTopLevelRoutes()).toEqual(["/", "/about"]);
  });

  it("ignores files (non-directories)", () => {
    mockReaddirSync.mockReturnValue([
      makeDirent("about", true),
      makeDirent("layout.tsx", false),
      makeDirent("page.tsx", false),
    ] as any);
    expect(getTopLevelRoutes()).toEqual(["/", "/about"]);
  });

  it("returns routes sorted alphabetically", () => {
    mockReaddirSync.mockReturnValue([
      makeDirent("zoo", true),
      makeDirent("about", true),
      makeDirent("blog", true),
    ] as any);
    expect(getTopLevelRoutes()).toEqual(["/", "/about", "/blog", "/zoo"]);
  });
});

describe("getRoutePriority()", () => {
  it('returns 1.0 for "/"', () => {
    expect(getRoutePriority("/")).toBe(1.0);
  });

  it("returns 0.8 for one-segment routes", () => {
    expect(getRoutePriority("/about")).toBe(0.8);
    expect(getRoutePriority("/blog")).toBe(0.8);
  });

  it("returns 0.6 for two-segment routes", () => {
    expect(getRoutePriority("/blog/post")).toBe(0.6);
  });

  it("returns 0.5 for three or more segments", () => {
    expect(getRoutePriority("/blog/2024/post")).toBe(0.5);
    expect(getRoutePriority("/a/b/c/d")).toBe(0.5);
  });
});

describe("getChangeFreq()", () => {
  it('returns "daily" for "/"', () => {
    expect(getChangeFreq("/")).toBe("daily");
  });

  it('returns "weekly" for one-segment routes', () => {
    expect(getChangeFreq("/about")).toBe("weekly");
    expect(getChangeFreq("/contact")).toBe("weekly");
  });

  it('returns "monthly" for two or more segments', () => {
    expect(getChangeFreq("/blog/post")).toBe("monthly");
    expect(getChangeFreq("/blog/2024/post")).toBe("monthly");
  });
});
