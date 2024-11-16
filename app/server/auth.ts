import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { Discord, GitHub, Google } from "arctic";
import { eq } from "drizzle-orm";
import { deleteCookie, getCookie, setCookie } from "vinxi/http";

import { db } from "~/server/db";
import {
  session as sessionTable,
  user as userTable,
  type Session,
} from "~/server/db/schema";

export const SESSION_COOKIE_NAME = "session";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

export async function createSession(token: string, userId: number): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    user_id: userId,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(sessionTable).values(session);
  return session;
}

export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({
      user: {
        // Only return the necessary user data for the client
        id: userTable.id,
        name: userTable.name,
        // first_name: userTable.first_name,
        // last_name: userTable.last_name,
        avatar_url: userTable.avatar_url,
        email: userTable.email,
        setup_at: userTable.setup_at,
      },
      session: sessionTable,
    })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.user_id, userTable.id))
    .where(eq(sessionTable.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.expires_at.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expires_at: session.expires_at,
      })
      .where(eq(sessionTable.id, session.id));
  }

  return { session, user };
}

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof validateSessionToken>>["user"]
>;

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export function setSessionTokenCookie(token: string, expiresAt: Date) {
  setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

// OAuth2 Providers
export const discord = new Discord(
  process.env.DISCORD_CLIENT_ID as string,
  process.env.DISCORD_CLIENT_SECRET as string,
  process.env.DISCORD_REDIRECT_URI as string,
);
export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID as string,
  process.env.GITHUB_CLIENT_SECRET as string,
  process.env.GITHUB_REDIRECT_URI || null,
);
export const google = new Google(
  process.env.GOOGLE_CLIENT_ID as string,
  process.env.GOOGLE_CLIENT_SECRET as string,
  process.env.GOOGLE_REDIRECT_URI as string,
);

/**
 * Retrieves the session and user data if valid.
 * Can be used in API routes and server functions.
 */
export async function getAuthSession({ refreshCookie } = { refreshCookie: true }) {
  const token = getCookie(SESSION_COOKIE_NAME);
  if (!token) {
    return { session: null, user: null };
  }
  const { session, user } = await validateSessionToken(token);
  if (session === null) {
    deleteCookie(SESSION_COOKIE_NAME);
    return { session: null, user: null };
  }
  if (refreshCookie) {
    setSessionTokenCookie(token, session.expires_at);
  }
  return { session, user };
}
