import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";
import { roles } from "./rbac";

export const user = mysqlTable("app_user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  roleKey: varchar("role_key", { length: 255 })
    .notNull()
    .references(() => roles.key, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
