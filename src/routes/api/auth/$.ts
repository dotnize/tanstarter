import { auth } from "~/lib/server/auth";

export const ServerRoute = createServerFileRoute().methods({
  GET: ({ request }) => {
    return auth.handler(request);
  },
  POST: ({ request }) => {
    return auth.handler(request);
  },
});
