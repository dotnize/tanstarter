import { createAPIFileRoute } from "@tanstack/start/api";
import { OAuth2RequestError } from "arctic";
import { and, eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { parseCookies } from "vinxi/http";
import { facebook, lucia } from "~/server/auth";
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
          eq(oauthAccount.providerId, "facebook"),
          eq(oauthAccount.providerUserId, facebookUser.id),
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
          email: facebookUser.email,
          name: facebookUser.name,
          firstName: facebookUser.first_name,
          lastName: facebookUser.last_name,
          avatarUrl: facebookUser.picture.data.url,
        });
        await tx
          .insert(oauthAccount)
          .values({ providerId: "facebook", providerUserId: facebookUser.id, userId });
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
