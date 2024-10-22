import { createServerFn, json } from "@tanstack/start";
import { getAuthSession } from "~/server/auth";

export const getUser = createServerFn("GET", async () => {
  const { user } = await getAuthSession();
  return json(user);
});
