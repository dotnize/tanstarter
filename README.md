# [TanStarter](https://github.com/dotnize/tanstarter)

A minimal starter template for 🏝️ TanStack Start.

- TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL
- Auth based on [Lucia](https://lucia-auth.com/)

Auth providers:

- [x] GitHub
- [x] Google
- [x] Discord

## Getting Started

1. [Use this template](https://github.com/new?template_name=tanstarter&template_owner=dotnize) or clone this repository.

2. Install dependencies:

   ```bash
   pnpm install # or npm install
   ```

3. Create a `.env` file based on [`.env.example`](./.env.example).

4. Run the development server:

   ```bash
   pnpm dev # or npm run dev
   ```

   The development server should be now running at [http://localhost:3000](http://localhost:3000).

## Building for production

1. Configure [`app.config.ts`](./app.config.ts#L15) for your preferred deployment target. Read the [hosting](https://tanstack.com/router/latest/docs/framework/react/start/hosting#deployment) docs for more information.

2. Build the application:

   ```bash
   pnpm build # or npm run build
   ```

3. If building for Node, you start the application via:

   ```bash
   pnpm start # or npm start
   ```
