import fs from "fs";
import path from "path";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "src", "app");

/**
 * Top-level folders in src/app that are not public page routes.
 * Extend this list when adding new non-page route handlers.
 */
const EXCLUDED_DIRS = new Set(["api", "sitemap.xml", "robots.txt"]);

/**
 * Derive the base URL for the current HTTP request from request headers.
 *
 * Prefers `x-forwarded-proto` when present (reverse proxy environments),
 * and falls back to `https` + `localhost:3000` for local development.
 *
 * @param h - ReadonlyHeaders instance from `next/headers`.
 * @returns Base URL string, e.g. `"https://example.com"`.
 *
 * @example
 * const baseUrl = getRequestBaseUrl(headers());
 */
export function getRequestBaseUrl(h: ReadonlyHeaders): string {
  const protocol = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host") ?? "localhost:3000";
  return `${protocol}://${host}`;
}

/**
 * Compute the set of top-level routes from folder names in `src/app`.
 *
 * Always includes `"/"`. Each top-level directory becomes `"/<name>"`,
 * excluding technical folders defined in {@link EXCLUDED_DIRS}.
 *
 * Intended for simple projects where each top-level folder maps
 * directly to a public page route.
 *
 * @returns Sorted list of route strings, e.g. `["/", "/about", "/blog"]`.
 *
 * @example
 * const routes = getTopLevelRoutes();
 * // ["/", "/about", "/blog"]
 */
export function getTopLevelRoutes(): string[] {
  const entries = fs.readdirSync(APP_DIR, { withFileTypes: true });

  const routes = entries
    .filter((e) => e.isDirectory() && !EXCLUDED_DIRS.has(e.name))
    .map((e) => `/${e.name}`);

  return ["/", ...routes].sort();
}

/**
 * Derive a sitemap `<priority>` value for a given route.
 *
 * Heuristic based on path depth:
 * - `"/"` → `1.0`
 * - One segment (e.g. `"/about"`) → `0.8`
 * - Two segments (e.g. `"/blog/post"`) → `0.6`
 * - Three or more segments → `0.5`
 *
 * @param route - Route path, e.g. `"/"`, `"/about"`, `"/blog/post"`.
 * @returns Priority value between `0.5` and `1.0`.
 *
 * @example
 * getRoutePriority("/")          // 1.0
 * getRoutePriority("/about")     // 0.8
 * getRoutePriority("/blog/post") // 0.6
 */
export function getRoutePriority(route: string): number {
  if (route === "/") return 1.0;
  const depth = route.split("/").filter(Boolean).length;
  if (depth === 1) return 0.8;
  if (depth === 2) return 0.6;
  return 0.5;
}

/**
 * Derive a sitemap `<changefreq>` value for a given route.
 *
 * Heuristic based on path depth:
 * - `"/"` → `"daily"`
 * - One segment (e.g. `"/about"`) → `"weekly"`
 * - Two or more segments → `"monthly"`
 *
 * @param route - Route path, e.g. `"/"`, `"/about"`, `"/blog/post"`.
 * @returns One of `"daily"`, `"weekly"`, or `"monthly"`.
 *
 * @example
 * getChangeFreq("/")        // "daily"
 * getChangeFreq("/about")   // "weekly"
 * getChangeFreq("/blog/post") // "monthly"
 */
export function getChangeFreq(route: string): "daily" | "weekly" | "monthly" {
  if (route === "/") return "daily";
  const depth = route.split("/").filter(Boolean).length;
  if (depth === 1) return "weekly";
  return "monthly";
}
