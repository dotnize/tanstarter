import { createServerFn, json } from "@tanstack/start";
import { parseCookies, setCookie } from "vinxi/http";
import { lucia } from "~/server/auth";

export const getSession = createServerFn("GET", async () => {
  const sessionId = parseCookies()[lucia.sessionCookieName];
  if (!sessionId) {
    return json({ user: null });
  }

  const result = await lucia.validateSession(sessionId);

  if (result.session?.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }
  if (!result.session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }

  return json({ user: result.user });
});
