import { createServerFn, json } from "@tanstack/start";
import { lucia } from "~/server/auth";

export const getSession = createServerFn("GET", async (_, { request }) => {
  const cookie = request.headers.get("cookie");
  if (!cookie) {
    return json({ user: null });
  }
  const sessionId = lucia.readSessionCookie(cookie);
  if (!sessionId) {
    return json({ user: null });
  }

  const result = await lucia.validateSession(sessionId);
  const headers = new Headers();

  if (result.session?.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    headers.append("Set-Cookie", sessionCookie.serialize());
  }
  if (!result.session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    headers.append("Set-Cookie", sessionCookie.serialize());
  }

  return json({ user: result.user }, { headers });
});
