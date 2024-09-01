import { createAPIFileRoute } from "@tanstack/start/api";
import { generateState } from "arctic";
import { setCookie, setHeader } from "vinxi/http";

import { facebook } from "~/server/auth";

export const Route = createAPIFileRoute("/api/auth/facebook")({
  GET: async () => {
    const state = generateState();

    const url = facebook.createAuthorizationURL(state, ["public_profile", "email"]);

    setCookie("facebook_oauth_state", state, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

    setHeader("Location", url.toString());

    return new Response(null, {
      status: 302,
    });
  },
});
