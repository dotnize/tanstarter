import { createAPIFileRoute } from "@tanstack/start/api";
import { lucia } from "~/server/auth";

export const Route = createAPIFileRoute("/api/auth/logout")({
  POST: async ({ request }) => {
    // TODO: cleanup boilerplate
    const cookie = request.headers.get("cookie");
    if (!cookie) {
      return new Response(null, {
        status: 401,
        headers: {
          Location: "/",
        },
      });
    }
    const sessionId = lucia.readSessionCookie(cookie);
    if (!sessionId) {
      return new Response(null, {
        status: 401,
        headers: {
          Location: "/",
        },
      });
    }

    const { session } = await lucia.validateSession(sessionId);
    const sessionCookie = lucia.createBlankSessionCookie();

    if (!session) {
      return new Response(null, {
        status: 401,
        headers: {
          "Set-Cookie": sessionCookie.serialize(),
          Location: "/",
        },
      });
    }

    await lucia.invalidateSession(session.id);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": sessionCookie.serialize(),
      },
    });
  },
});
