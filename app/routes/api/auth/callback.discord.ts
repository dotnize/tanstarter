import { createAPIFileRoute } from "@tanstack/start/api";
import { OAuth2RequestError } from "arctic";
import { and, eq } from "drizzle-orm";
import { parseCookies } from "vinxi/http";
import {
  createSession,
  discord,
  generateSessionToken,
  setSessionTokenCookie,
} from "~/server/auth";
import { db } from "~/server/db";
import { oauthAccount, user } from "~/server/db/schema";

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
  email: string;
  verified: boolean;
}

export const Route = createAPIFileRoute("/api/auth/callback/discord")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const cookies = parseCookies();
    const storedState = cookies.discord_oauth_state;

    if (!code || !state || !storedState || state !== storedState) {
      return new Response(null, {
        status: 400,
      });
    }

    try {
      const tokens = await discord.validateAuthorizationCode(code);
      const discordUserResponse = await fetch("https://discord.com/api/v10/users/@me", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });
      const discordUser: DiscordUser = await discordUserResponse.json();

      const existingUser = await db.query.oauthAccount.findFirst({
        where: and(
          eq(oauthAccount.provider_id, "discord"),
          eq(oauthAccount.provider_user_id, discordUser.id),
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
            email: discordUser.email,
            name: discordUser.global_name || discordUser.username,
            avatar_url: discordUser.avatar
              ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
              : null,
          })
          .returning({ newId: user.id });
        await tx.insert(oauthAccount).values({
          provider_id: "discord",
          provider_user_id: discordUser.id,
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
