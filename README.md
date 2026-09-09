# Stephen Pangan | Developer Portfolio 🏝️

A modern, static-first personal portfolio featuring a responsive "Bento box" island layout. Built to showcase my projects across software development, systems programming, and DevOps, this site automatically synchronizes with my latest public GitHub repositories using a secure CI/CD pipeline.

## 🏗️ Architecture & Tech Stack

This project uses an **Islands Architecture** to deliver a blazing-fast static site while maintaining rich interactivity.

*   **Framework:** [Astro](https://astro.build/) - For zero-JS static HTML generation and component island routing.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) - For the responsive CSS Grid (Bento box) layout and design tokens.
*   **Interactive Background:** [React](https://react.dev/) & [React Bits](https://reactbits.dev/) - Powers the lightweight `DotField` canvas animation (`client:load`).
*   **Data Fetching:** Node.js / TypeScript - A pre-build script that queries the GitHub GraphQL API.
*   **CI/CD & Deployment:** GitHub Actions - Automates fetching, building, and deploying to GitHub Pages daily.

## ⚙️ How the Dynamic Sync Works

To bypass frontend API rate limits and keep tokens secure, this portfolio uses a static generation approach:
1. Every day at midnight (UTC), or upon a manual push, a GitHub Actions workflow triggers.
2. A TypeScript script (`scripts/fetch-repos.ts`) runs, using a secure Fine-Grained Personal Access Token to query the GitHub GraphQL API.
3. The script extracts metadata (names, descriptions, languages) from my latest public repositories and saves it locally.
4. Astro builds the site, injecting this fresh JSON data into the Bento box components.
5. The compiled, static HTML/CSS is deployed to GitHub Pages.
