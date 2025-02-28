import type { Config } from "drizzle-kit";

export default {
  out: "./.drizzle",
  schema: "./lib/server/schema/index.ts",
  breakpoints: true,
  verbose: true,
  strict: true,
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
} satisfies Config;
