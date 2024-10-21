import { createServerFn, json } from "@tanstack/start";
import { deleteCookie, getCookie } from "vinxi/http";
import { setSessionTokenCookie, validateSessionToken } from "~/server/auth";

export const getUser = createServerFn("GET", async () => {
  const token = getCookie("session");
  if (!token) {
    return json({ user: null });
  }

  const { session, user } = await validateSessionToken(token);

  if (session === null) {
    deleteCookie("session");
    return json({ user: null });
  }

  setSessionTokenCookie(token, session.expires_at);

  return json({ user });
});
