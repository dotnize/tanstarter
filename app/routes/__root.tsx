import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import { lazy, Suspense } from "react";

import { getUser } from "~/server/functions";
import appCss from "~/styles/app.css?url";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async () => {
    const user = await getUser();
    return { user };
  },
  component: RootComponent,
  meta: () => [
    {
      charSet: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      title: "TanStarter",
    },
  ],
  links: () => [{ rel: "stylesheet", href: appCss }],
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
        <Scripts />
        {/* eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml */}
        <script
          id="theme"
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.toggle(
                      'dark',
                      localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
                    )`,
          }}
        ></script>
      </body>
    </html>
  );
}
