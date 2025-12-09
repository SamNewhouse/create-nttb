import { headers } from "next/headers";
import {
  getRequestBaseUrl,
  getTopLevelRoutes,
  getRoutePriority,
  getChangeFreq,
} from "../../utils/site";

/**
 * Revalidation interval (in seconds) for the sitemap.xml route.
 *
 * This enables ISR-like behaviour for the generated sitemap:
 * - The first request after the cache window regenerates the XML.
 * - Subsequent requests within the window are served from cache.
 */
export const revalidate = 60;

/**
 * Route handler for /sitemap.xml.
 *
 * This generates a basic XML sitemap that:
 * - Derives the base URL from the current request headers.
 * - Discovers top-level routes automatically from src/app.
 * - Assigns a priority to each route based on its depth.
 * - Derives a changefreq value automatically based on route depth.
 * - Sets a shared lastmod timestamp for all entries.
 *
 * The result is a fully dynamic sitemap that updates automatically
 * when new top-level route folders are added under src/app, with
 * sensible default metadata for search engines.
 */
export async function GET() {
  const h = await headers();
  const baseUrl = getRequestBaseUrl(h);

  const routes = getTopLevelRoutes();
  const now = new Date().toISOString();

  const urls = routes.map((route) => ({
    loc: `${baseUrl}${route}`,
    priority: getRoutePriority(route),
    lastmod: now,
    changefreq: getChangeFreq(route),
  }));

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map(
        ({ loc, priority, lastmod, changefreq }) =>
          `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
      )
      .join("") +
    `</urlset>`;

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
