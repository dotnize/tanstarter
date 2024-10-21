import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text(),
  first_name: text(),
  last_name: text(),
  avatar_url: text(),
  email: text().unique().notNull(),

  created_at: timestamp().defaultNow().notNull(),
  setup_at: timestamp(),
  terms_accepted_at: timestamp(),
});

export const oauthAccount = pgTable(
  "oauth_account",
  {
    provider_id: text(),
    provider_user_id: text(),
    user_id: integer()
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider_id, table.provider_user_id] }),
  }),
);

export const session = pgTable("session", {
  id: text().primaryKey(),
  user_id: integer()
    .notNull()
    .references(() => user.id),
  expires_at: timestamp({
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

// TODO: tables for payment gateways

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
