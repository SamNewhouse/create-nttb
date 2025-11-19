# creat-nttb

## Next.js TypeScript Tailwind Boilerplate by Sam Newhouse

This boilerplate is structured to organise code clearly and enable scalable development using Atomic Design principles and Next.js 16 with TypeScript and Tailwind CSS. It provides a robust architectural foundation for scalable React applications, blending the latest tools and community conventions into a ready-to-use starter kit.

Designed for rapid project bootstrapping and consistent best practice, this opinionated setup saves you hours of repetitive work each time you start a new project. With an organised component hierarchy, streamlined state and HTTP management, and instant access to modern developer experience features, you’ll be able to jump straight into feature development and deliver high-quality apps faster.

---

## Getting Started

Use one of the following commands to initialise your project quickly:

```bash
npm create nttb app-name
```
OR
```bash
npx create-nttb app-name
```

When the setup finishes, navigate into your new app directory and install dependencies:

```bash
cd app-name
npm install
```
You’re now ready to start developing—see below for more useful commands.

### Environment variables 
Copy the example env file and set your values:

```bash
cp .env.example .env
```

### Common codebase scripts

**Run Development Server**
```bash
npm run dev
```

**Format Code**
```bash
npm run format
```

**Build for Production**
```bash
npm run build
```

**Start Production Server**
```bash
npm run start
```
---

## Key Packages Used

- **Next.js 16**  
  React framework providing server-side rendering, routing, and API routes.

- **Tailwind CSS**  
  Utility-first CSS framework and PostCSS integration for rapid styling.

- **TypeScript**  
  Adds static typing to JavaScript for better developer experience and fewer errors.

- **Axios**  
  HTTP client for making API requests easily.

- **Prettier**  
  Automated code formatter enforcing consistent formatting.

---

## Learn More

To learn more about Next.js, TypeScript, Tailwind, Axios, and Prettier, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [TypeScript](https://www.typescriptlang.org/) - Learn about TypeScript and all of its features.
- [Tailwind CSS](https://tailwindcss.com/) - The holy grail of all things Tailwind.
- [Axios Documentation](https://axios-http.com/docs/intro) - Comprehensive guide to the Axios HTTP client.
- [Prettier Documentation](https://prettier.io/docs/en/index.html) - Learn how to use Prettier for consistent code formatting.

## Folder Structure

```bash
public/                 # Static assets (images, favicon, etc.)
src/                    # Source code
├── app/                # Routing, pages, API
│   ├── api/            # API handlers
├── config/             # Config and env variables
├── presentation/       # Components by Atomic Design
│   ├── 1-atoms/        # Basic UI elements
│   ├── 2-molecules/    # UI groups
│   ├── 3-organisms/    # Sections
│   ├── 4-layouts/      # Layout components
│   └── 5-pages/        # Complete pages
├── styles/             # Global CSS/Tailwind
├── types/              # TypeScript types
└── utils/              # Utility functions
```
---

## Licence

This project is licensed under the ISC Licence - see the [LICENSE](./LICENSE) file for details.
