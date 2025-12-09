import fs from "fs";
import path from "path";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

/**
 * Absolute path to the project root (directory where Next.js is executed).
 */
const ROOT = process.cwd();

/**
 * Absolute path to the Next.js app directory that defines routes.
 */
const APP_DIR = path.join(ROOT, "src", "app");

/**
 * Derive the base URL for the current HTTP request from the request headers.
 *
 * This is intended for use in server-only contexts such as route handlers.
 * It prefers the x-forwarded-proto header when present (for proxies),
 * and falls back to https + localhost:3000 when running locally.
 *
 * @param h ReadonlyHeaders instance from next/headers
 * @returns Base URL string, e.g. "https://example.com"
 */
export function getRequestBaseUrl(h: ReadonlyHeaders): string {
  const protocol = h.get("x-forwarded-proto") || "https";
  const host = h.get("host") || "localhost:3000";
  return `${protocol}://${host}`;
}

/**
 * Compute the set of top-level routes based on folder names in src/app.
 *
 * - Always includes the root route "/".
 * - Includes each top-level directory in src/app as "/<name>".
 * - Excludes technical folders that should not be exposed as pages:
 *   - "api"           → API routes
 *   - "sitemap.xml"   → sitemap route handler folder
 *   - "robots.txt"    → robots.txt route handler folder
 *
 * This is intended for simple projects where each top-level folder
 * corresponds directly to a public route.
 *
 * @returns Sorted list of routes such as ["/", "/about", "/blog"]
 */
export function getTopLevelRoutes(): string[] {
  const entries = fs.readdirSync(APP_DIR, { withFileTypes: true });

  const routes = ["/"];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    if (entry.name === "api" || entry.name === "sitemap.xml" || entry.name === "robots.txt") {
      continue;
    }

    routes.push(`/${entry.name}`);
  }

  return routes.sort();
}

/**
 * Derive a sitemap <priority> value for a given route automatically.
 *
 * Heuristic:
 * - Root route "/" gets highest priority 1.0.
 * - Shallow routes (e.g. "/about") get 0.8.
 * - One level deeper (e.g. "/blog/post") get 0.6.
 * - Deeper paths get 0.5.
 *
 * This keeps priorities fully automatic and independent of specific route names.
 *
 * @param route Route path, e.g. "/", "/about", "/blog/post"
 * @returns Priority value between 0.5 and 1.0
 */
export function getRoutePriority(route: string): number {
  if (route === "/") return 1.0;

  const depth = route.split("/").filter(Boolean).length;

  if (depth === 1) return 0.8;
  if (depth === 2) return 0.6;
  return 0.5;
}

/**
 * Derive a sitemap <changefreq> value for a given route automatically.
 *
 * Heuristic:
 * - Root "/" changes most often → "daily".
 * - Shallow routes (e.g. "/about") → "weekly".
 * - Deeper routes → "monthly".
 */
export function getChangeFreq(route: string): "daily" | "weekly" | "monthly" {
  if (route === "/") return "daily";

  const depth = route.split("/").filter(Boolean).length;

  if (depth === 1) return "weekly";
  return "monthly";
}
