# [TanStarter](https://github.com/dotnize/tanstarter)

A minimal starter template for 🏝️ TanStack Start.

- TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL
- [Better Auth](https://www.better-auth.com/) with OAuth2 for GitHub, Google, and Discord.

> If you're looking for an implementation based on the [Lucia Auth](https://lucia-auth.com) guide, check out the [`lucia-auth`](https://github.com/dotnize/tanstarter/tree/lucia-auth) branch.

## Getting Started

1. [Use this template](https://github.com/new?template_name=tanstarter&template_owner=dotnize) or clone this repository.

2. Install dependencies:

   ```bash
   pnpm install # npm install
   ```

3. Create a `.env` file based on [`.env.example`](./.env.example).

4. In your OAuth2 apps, set the callback/redirect URIs to `http://localhost:3000/api/auth/callback/<provider>` (e.g. http://localhost:3000/api/auth/callback/github).

5. Push the schema to your database with drizzle-kit:

   ```bash
   pnpm db push # npm run db push
   ```

   https://orm.drizzle.team/docs/migrations

6. Run the development server:

   ```bash
   pnpm dev # npm run dev
   ```

   The development server should be now running at [http://localhost:3000](http://localhost:3000).

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

## Acknowledgements

- [nekochan0122/tanstack-boilerplate](https://github.com/nekochan0122/tanstack-boilerplate) - A batteries-included TanStack Start boilerplate that inspired some patterns in this template. If you're looking for a more feature-rich starter, check it out!
- [AlexGaudon/tanstarter-better-auth](https://github.com/AlexGaudon/tanstarter-better-auth) for his own better-auth implementation.
