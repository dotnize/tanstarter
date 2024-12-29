import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const driver = postgres(process.env.DATABASE_URL as string);
export const db = drizzle({ client: driver, schema });

export const table = schema;

// You can export your schema types here
export type User = typeof schema.user.$inferSelect;
