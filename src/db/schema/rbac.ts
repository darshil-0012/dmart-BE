import { mysqlTable, varchar, primaryKey } from "drizzle-orm/mysql-core";

export const roles = mysqlTable("roles", {
  role: varchar("role", { length: 255 }).primaryKey(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
});

export const permission = mysqlTable("permission", {
  permission: varchar("permission", { length: 255 }).primaryKey(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
});

export const rolePermissions = mysqlTable(
  "role_permission",
  {
    role: varchar("role", { length: 255 })
      .notNull()
      .references(() => roles.role, { onDelete: "cascade" }),
    permission: varchar("permission", { length: 255 })
      .notNull()
      .references(() => permission.permission, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.role, table.permission] }),
  })
);
