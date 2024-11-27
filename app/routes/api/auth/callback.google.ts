import { createAPIFileRoute } from "@tanstack/start/api";
import { OAuth2RequestError } from "arctic";
import { and, eq } from "drizzle-orm";
import { parseCookies } from "vinxi/http";
import {
  createSession,
  generateSessionToken,
  google,
  setSessionTokenCookie,
} from "~/server/auth";
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

export const APIRoute = createAPIFileRoute("/api/auth/callback/google")({
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

    const PROVIDER_ID = "google";

    try {
      const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
      const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });
      const providerUser: GoogleUser = await response.json();

      const existingUser = await db.query.oauthAccount.findFirst({
        where: and(
          eq(oauthAccount.provider_id, PROVIDER_ID),
          eq(oauthAccount.provider_user_id, providerUser.sub),
        ),
      });

      if (existingUser) {
        const token = generateSessionToken();
        const session = await createSession(token, existingUser.user_id);
        setSessionTokenCookie(token, session.expires_at);
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
          },
        });
      } else {
        const existingUserEmail = await db.query.user.findFirst({
          where: eq(user.email, providerUser.email),
        });
        if (existingUserEmail) {
          await db.insert(oauthAccount).values({
            provider_id: PROVIDER_ID,
            provider_user_id: providerUser.sub,
            user_id: existingUserEmail.id,
          });
          const token = generateSessionToken();
          const session = await createSession(token, existingUserEmail.id);
          setSessionTokenCookie(token, session.expires_at);
          return new Response(null, {
            status: 302,
            headers: {
              Location: "/",
            },
          });
        }
      }

      const userId = await db.transaction(async (tx) => {
        const [{ newId }] = await tx
          .insert(user)
          .values({
            email: providerUser.email,
            name: providerUser.name,
            // first_name: providerUser.given_name,
            // last_name: providerUser.family_name,
            avatar_url: providerUser.picture,
          })
          .returning({ newId: user.id });
        await tx.insert(oauthAccount).values({
          provider_id: PROVIDER_ID,
          provider_user_id: providerUser.sub,
          user_id: newId,
        });
        return newId;
      });

      const token = generateSessionToken();
      const session = await createSession(token, userId);
      setSessionTokenCookie(token, session.expires_at);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    } catch (e) {
      console.log(e);
      if (e instanceof OAuth2RequestError) {
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
