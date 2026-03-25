# Copilot Instructions

## Tech Stack

- Next.js 16.2.1 (App Router ONLY)
- Tailwind CSS v4 (`tailwindcss: ^4`, `@tailwindcss/postcss: ^4`)

## Coding Conventions

- Default to Server Components in the App Router.
- Use Tailwind CSS only for styling (no CSS-in-JS, no component-scoped style libraries).

## Known AI Mistakes

- Do not use `next/router`; use `next/navigation`.
- Do not use the Pages Router (`pages/`, `getServerSideProps`, `getStaticProps`, `getInitialProps`).
- Always `await` `params` before accessing route parameters.
