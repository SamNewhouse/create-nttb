/**
 * config/variables.ts
 *
 * This file centralizes your environment variables and config constants.
 *
 * - Add all your required environment variables here for easy management and import throughout the project.
 * - Throw a runtime error or use the non-null assertion (!) for REQUIRED variables to "fail fast" if misconfigured.
 * - Provides a single source of truth for all config that may differ between local, staging, and production environments.
 */

export const NEXT_PUBLIC_API_URL: string = process.env.NEXT_PUBLIC_API_URL!;
