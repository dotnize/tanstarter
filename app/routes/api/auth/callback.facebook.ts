import { createAPIFileRoute } from "@tanstack/start/api";
import { OAuth2RequestError } from "arctic";
import { and, eq } from "drizzle-orm";
import { parseCookies } from "vinxi/http";
import {
  createSession,
  facebook,
  generateSessionToken,
  setSessionTokenCookie,
} from "~/server/auth";
import { db } from "~/server/db";
import { oauthAccount, user } from "~/server/db/schema";

interface FacebookUser {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  picture: {
    data: { height: number; width: number; is_silhouette: boolean; url: string };
  };
  email: string;
}

export const Route = createAPIFileRoute("/api/auth/callback/facebook")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const cookies = parseCookies();
    const storedState = cookies.facebook_oauth_state;

    if (!code || !state || !storedState || state !== storedState) {
      return new Response(null, {
        status: 400,
      });
    }

    try {
      const tokens = await facebook.validateAuthorizationCode(code);
      const url = new URL("https://graph.facebook.com/me");
      url.searchParams.set("access_token", tokens.accessToken());
      url.searchParams.set(
        "fields",
        ["id", "name", "first_name", "last_name", "picture", "email"].join(","),
      );
      const response = await fetch(url);
      const facebookUser: FacebookUser = await response.json();

      const existingUser = await db.query.oauthAccount.findFirst({
        where: and(
          eq(oauthAccount.provider_id, "facebook"),
          eq(oauthAccount.provider_user_id, facebookUser.id),
        ),
      });

      // TODO:
      /**
       * if no existingUser, check if there is a user with the same email
       * then prompt to link the account (or just force?)
       */

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
      }

      const userId = await db.transaction(async (tx) => {
        const [{ newId }] = await tx
          .insert(user)
          .values({
            email: facebookUser.email,
            name: facebookUser.name,
            first_name: facebookUser.first_name,
            last_name: facebookUser.last_name,
            avatar_url: facebookUser.picture.data.url,
          })
          .returning({ newId: user.id });
        await tx.insert(oauthAccount).values({
          provider_id: "facebook",
          provider_user_id: facebookUser.id,
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
