import { headers } from "next/headers";
import { getRequestBaseUrl } from "../../utils/site";

/**
 * Revalidation interval (in seconds) for the robots.txt route.
 *
 * This enables ISR-like behaviour for the generated robots.txt:
 * - The first request after the cache window regenerates the content.
 * - Subsequent requests within the window are served from cache.
 */
export const revalidate = 60;

/**
 * Route handler for /robots.txt.
 *
 * This generates a minimal, crawl-friendly robots.txt that:
 * - Allows all user agents to crawl the site.
 * - Disallows access to the /api/ namespace.
 * - Points crawlers at the dynamically generated /sitemap.xml.
 *
 * The base URL is derived from the current request headers so that it works
 * correctly across environments (local, staging, production) without
 * hardcoding a domain.
 */
export async function GET() {
  const h = await headers();
  const baseUrl = getRequestBaseUrl(h);

  const robotsTxt =
    `User-agent: *\n` + `Allow: /\n` + `Disallow: /api/\n` + `Sitemap: ${baseUrl}/sitemap.xml\n`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
