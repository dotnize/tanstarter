import { serverOnly } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env/server";

import * as schema from "~/lib/db/schema";

const driver = postgres(env.DATABASE_URL);

const getDatabase = serverOnly(() =>
  drizzle({ client: driver, schema, casing: "snake_case" }),
);

export const db = getDatabase();
