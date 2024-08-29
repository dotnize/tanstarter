import { createAPIFileRoute } from "@tanstack/start/api";
import { generateState } from "arctic";
import { serializeCookie } from "oslo/cookie";

import { github } from "~/server/auth";

export const Route = createAPIFileRoute("/api/auth/github")({
  GET: async () => {
    const state = generateState();

    const url = github.createAuthorizationURL(state, ["user:email"]);

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      serializeCookie("github_oauth_state", state, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax",
      }),
    );
    headers.append("Location", url.toString());

    return new Response(null, {
      status: 302,
      headers,
    });
  },
});
