import { createMiddleware } from "@tanstack/start";
import { getWebRequest, setResponseStatus } from "@tanstack/start/server";
import { auth } from "~/lib/server/auth";

/**
 * Middleware to force authentication on a server function, and add the user to the context.
 */
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const { headers } = getWebRequest()!;

  const session = await auth.api.getSession({ headers });

  if (!session) {
    setResponseStatus(401);
    throw new Error("Unauthorized");
  }

  return next({ context: { user: session.user } });
});
