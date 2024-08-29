import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  email: text("email").unique().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  setupAt: timestamp("setup_at"),
  termsAcceptedAt: timestamp("terms_accepted_at"),
});

export const oauthAccount = pgTable(
  "oauth_account",
  {
    providerId: text("provider_id"),
    providerUserId: text("provider_user_id"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({ pk: primaryKey({ columns: [table.providerId, table.providerUserId] }) }),
);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

// TODO: tables for payment gateways

export type User = typeof user.$inferSelect;
