import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  username: text().primaryKey(),
  passwordHash: text().notNull(),
  createdAt: text().notNull().default("CURRENT_TIMESTAMP"),
});
