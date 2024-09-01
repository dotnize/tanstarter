import { createAPIFileRoute } from "@tanstack/start/api";
import { OAuth2RequestError } from "arctic";
import { and, eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { parseCookies } from "vinxi/http";
import { google, lucia } from "~/server/auth";
import { db } from "~/server/db";
import { oauthAccount, user } from "~/server/db/schema";

interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
  email_verified: boolean;
  locale: string;
}

export const Route = createAPIFileRoute("/api/auth/callback/google")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const cookies = parseCookies();
    const storedState = cookies.google_oauth_state;
    const storedCodeVerifier = cookies.google_code_verifier;

    if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
      return new Response(null, {
        status: 400,
      });
    }

    try {
      const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
      const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });
      const googleUser: GoogleUser = await response.json();

      const existingUser = await db.query.oauthAccount.findFirst({
        where: and(
          eq(oauthAccount.providerId, "google"),
          eq(oauthAccount.providerUserId, googleUser.sub),
        ),
      });

      // TODO:
      /**
       * if no existingUser, check if there is a user with the same email
       * then prompt to link the account (or just force?)
       */

      if (existingUser) {
        const session = await lucia.createSession(existingUser.userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": sessionCookie.serialize(),
          },
        });
      }

      const userId = generateIdFromEntropySize(10); // 16 characters

      await db.transaction(async (tx) => {
        await tx.insert(user).values({
          id: userId,
          email: googleUser.email,
          name: googleUser.name,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          avatarUrl: googleUser.picture,
        });
        await tx
          .insert(oauthAccount)
          .values({ providerId: "google", providerUserId: googleUser.sub, userId });
      });

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": sessionCookie.serialize(),
        },
      });
    } catch (e) {
      // TODO: dev debugging purposes
      console.log(e);
      // the specific error message depends on the provider
      if (e instanceof OAuth2RequestError) {
        // invalid code
        return new Response(null, {
          status: 400,
        });
      }
      return new Response(null, {
        status: 500,
      });
    }
  },
});
