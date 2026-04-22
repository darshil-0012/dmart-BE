import { mysqlTable, varchar, timestamp, index } from "drizzle-orm/mysql-core";

import { user } from "./user";

export const refreshSessions = mysqlTable(
  "refresh_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("refresh_sessions_user_id_idx").on(table.userId)]
);
