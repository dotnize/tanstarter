# [TanStarter](https://github.com/dotnize/tanstarter)

A minimal starter template for 🏝️ TanStack Start.

- TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL
- [Better Auth](https://www.better-auth.com/) with OAuth2 for GitHub, Google, and Discord.

## Getting Started

1. [Use this template](https://github.com/new?template_name=tanstarter&template_owner=dotnize) or clone this repository.

2. Install dependencies:

   ```bash
   pnpm install # npm install
   ```

3. Create a `.env` file based on [`.env.example`](./.env.example).

4. Push the schema to your database with drizzle-kit:

   ```bash
   pnpm db push # npm run db push
   ```

   https://orm.drizzle.team/docs/migrations

5. Run the development server:

   ```bash
   pnpm dev # npm run dev
   ```

   The development server should be now running at [http://localhost:3000](http://localhost:3000).

## Goodies

#### Scripts

These scripts in [package.json](./package.json#L5) use pnpm by default, but you can update them to use other package managers if you prefer.

- **`auth:generate`** - Regenerate the [auth db schema](./lib/server/schema/auth.schema.ts) if you've made changes to your Better Auth [config](./lib/server/auth.ts).
- **`db`** - Run drizzle-kit commands. (e.g. `pnpm db generate` to generate a migration)
- **`ui`** - The shadcn/ui CLI. (e.g. `pnpm ui add button` to add the button component)
- **`format`** and **`lint`** - Run Prettier and ESLint.

#### Utilities

- [`auth-guard.ts`](./lib/middleware/auth-guard.ts) - Sample middleware for forcing authentication on server functions. ([see #5](https://github.com/dotnize/tanstarter/issues/5))
- [`ThemeToggle.tsx`](./lib/components/ThemeToggle.tsx) - A simple component to toggle between light and dark mode. ([#7](https://github.com/dotnize/tanstarter/issues/7))

## Building for production

1. Configure [`app.config.ts`](./app.config.ts#L15) for your preferred deployment target. Read the [hosting](https://tanstack.com/start/latest/docs/framework/react/hosting#deployment) docs for more information.

2. Build the application:

   ```bash
   pnpm build # npm run build
   ```

3. If building for Node, you start the application via:

   ```bash
   pnpm start # npm start
   ```

## Issue watchlist

- https://github.com/shadcn-ui/ui/issues/6585 - We're using the `canary` version of shadcn/ui for Tailwind CSS v4 support.
- https://github.com/lucide-icons/lucide/issues/2743, https://github.com/lucide-icons/lucide/issues/2775 - `lucide-react` is currently locked to 0.470.0 due to crashing deployments.

## Acknowledgements

- [nekochan0122/tanstack-boilerplate](https://github.com/nekochan0122/tanstack-boilerplate) - A batteries-included TanStack Start boilerplate that inspired some patterns in this template. If you're looking for a more feature-rich starter, check it out!
- [AlexGaudon/tanstarter-better-auth](https://github.com/AlexGaudon/tanstarter-better-auth) for his own better-auth implementation.
