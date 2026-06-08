# create-nttb

## Next.js TypeScript Tailwind Boilerplate by Sam Newhouse

This boilerplate is structured to organise code clearly and enable scalable development using Atomic Design principles and Next.js 16 with TypeScript and Tailwind CSS. It provides a robust architectural foundation for scalable React applications, blending the latest tools and community conventions into a ready-to-use starter kit.

Designed for rapid project bootstrapping and consistent best practice, this opinionated setup saves you hours of repetitive work each time you start a new project. With an organised component hierarchy, streamlined state and HTTP management, and instant access to modern developer experience features, you'll be able to jump straight into feature development and deliver high-quality apps faster.

---

## Getting Started

Use the following command to initialise your project:

```bash
npx create-nttb app-name
```

When the setup finishes, navigate into your new app directory and install dependencies:

```bash
cd app-name
npm install
```

You're now ready to start developing - see below for more useful commands.

### Environment Variables

Copy the example env file and set your values:

```bash
cp .env.example .env
```

### Common Scripts

| Script               | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start the development server       |
| `npm run build`      | Build for production               |
| `npm run start`      | Start the production server        |
| `npm run type-check` | Type-check without emitting output |
| `npm test`           | Run boilerplate unit tests         |
| `npm run format`     | Format code with Prettier          |

---

## Key Packages

- **Next.js 16** - React framework providing server-side rendering, routing, and App Router API routes.
- **Tailwind CSS** - Utility-first CSS framework and PostCSS integration for rapid styling.
- **TypeScript** - Static typing for better developer experience and fewer runtime errors.
- **Jest + ts-jest** - Unit testing with full TypeScript support.
- **Prettier** - Automated code formatter enforcing consistent style.

---

## Folder Structure

```bash
public/                 # Static assets (images, favicon, etc.)
src/                    # Source code
├── app/                # Next.js App Router - pages and API routes
│   └── api/            # Route handlers (App Router)
├── config/             # Config and environment variables
├── presentation/       # Components organised by Atomic Design
│   ├── 1-atoms/        # Basic UI elements
│   ├── 2-molecules/    # Composite UI groups
│   ├── 3-organisms/    # Page sections
│   ├── 4-layouts/      # Layout wrappers
│   └── 5-pages/        # Complete page compositions
├── styles/             # Global CSS and Tailwind entry point
├── types/              # Shared TypeScript types
└── utils/              # Utility functions (http, response, site)
```

---

## Utilities

### `utils/http.ts`

A typed `fetch` wrapper with automatic base URL, JSON headers, 5-second timeout via `AbortSignal`, and a typed `HttpError` class for consistent error handling.

```ts
const user = await request<User>("/users/1");
const created = await request<User>("/users", {
  method: "POST",
  body: JSON.stringify(data),
});
```

### `utils/response.ts`

Helper functions for App Router route handlers returning consistent `NextResponse` shapes:

```ts
return sendOk<User[]>(users); // 200
return sendCreated<User>(newUser); // 201
return sendNoContent(); // 204
return sendBadRequest("Invalid email"); // 400
return sendNotFound("User not found"); // 404
return sendError(503, "Unavailable"); // 500+
```

---

## SEO: Automatic Sitemap and robots.txt

Every project scaffolded with `create-nttb` includes dynamic generation of:

- `/sitemap.xml` - built from your `src/app` folder structure with sensible defaults for `lastmod`, `priority`, and `changefreq`.
- `/robots.txt` - served from a route handler that always points to the current `/sitemap.xml` URL and disallows `/api/`.

These files are generated at request time in production with incremental revalidation, so they stay up to date automatically as you add new top-level routes under `src/app`.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [Jest](https://jestjs.io/)

---

## Licence

This project is licensed under the ISC Licence - see the [LICENSE](./LICENSE) file for details.
