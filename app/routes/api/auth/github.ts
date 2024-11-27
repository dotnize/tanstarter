import { createAPIFileRoute } from "@tanstack/start/api";
import { generateState } from "arctic";
import { setCookie, setHeader } from "vinxi/http";

import { github } from "~/server/auth";

export const APIRoute = createAPIFileRoute("/api/auth/github")({
  GET: async () => {
    const state = generateState();

    const url = github.createAuthorizationURL(state, ["user:email"]);

    setCookie("github_oauth_state", state, {
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
