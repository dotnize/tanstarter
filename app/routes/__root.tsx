import { Outlet, ScrollRestoration, createRootRoute } from "@tanstack/react-router";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";

import { getSession } from "~/server/functions";
// @ts-expect-error import with a query string
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
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
  component: RootComponent,
  links: () => [{ rel: "stylesheet", href: appCss }],
  beforeLoad: async () => {
    const data = await getSession();
    return data;
  },
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
    <Html>
      <Head>
        <Meta />
      </Head>
      <Body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </Body>
    </Html>
  );
}
