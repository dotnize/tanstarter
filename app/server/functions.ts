import { createServerFn } from "@tanstack/start";
import { getAuthSession } from "~/server/auth";

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const { user } = await getAuthSession();
  return user;
});
