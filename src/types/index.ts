/**
 * types.ts
 *
 * Central location for shared TypeScript types used across your project.
 *
 * - Define standard API response shapes and data contracts here.
 * - Keeps your codebase consistent and reduces repetition.
 * - Import this type wherever you build API routes, services, or interfaces that return/respond with these fields.
 */

export type Data = {
  message?: string;
  error?: string;
};
