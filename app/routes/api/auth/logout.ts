import { createAPIFileRoute } from "@tanstack/start/api";
import { deleteCookie, getCookie, setHeader } from "vinxi/http";
import { invalidateSession, validateSessionToken } from "~/server/auth";

export const Route = createAPIFileRoute("/api/auth/logout")({
  POST: async () => {
    setHeader("Location", "/");

    const token = getCookie("session");
    if (!token) {
      return new Response(null, {
        status: 401,
      });
    }

    const { session } = await validateSessionToken(token);
    deleteCookie("session");

    if (!session) {
      return new Response(null, {
        status: 401,
      });
    }

    await invalidateSession(session.id);

    return new Response(null, {
      status: 302,
    });
  },
});
