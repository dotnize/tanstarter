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

export const APIRoute = createAPIFileRoute("/api/auth/callback/discord")({
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

    const PROVIDER_ID = "discord";

    try {
      const tokens = await discord.validateAuthorizationCode(code);
      const discordUserResponse = await fetch("https://discord.com/api/v10/users/@me", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });
      const providerUser: DiscordUser = await discordUserResponse.json();

      const existingUser = await db.query.oauthAccount.findFirst({
        where: and(
          eq(oauthAccount.provider_id, PROVIDER_ID),
          eq(oauthAccount.provider_user_id, providerUser.id),
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
            provider_user_id: providerUser.id,
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
            name: providerUser.global_name || providerUser.username,
            avatar_url: providerUser.avatar
              ? `https://cdn.discordapp.com/avatars/${providerUser.id}/${providerUser.avatar}.png`
              : null,
          })
          .returning({ newId: user.id });
        await tx.insert(oauthAccount).values({
          provider_id: PROVIDER_ID,
          provider_user_id: providerUser.id,
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
