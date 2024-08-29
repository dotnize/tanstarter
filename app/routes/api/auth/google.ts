import { createAPIFileRoute } from "@tanstack/start/api";
import { generateCodeVerifier, generateState } from "arctic";
import { serializeCookie } from "oslo/cookie";

import { google } from "~/server/auth";

export const Route = createAPIFileRoute("/api/auth/google")({
  GET: async () => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      serializeCookie("google_oauth_state", state, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax",
      }),
    );
    headers.append(
      "Set-Cookie",
      serializeCookie("google_code_verifier", codeVerifier, {
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
