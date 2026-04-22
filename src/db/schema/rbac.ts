import { mysqlTable, varchar, primaryKey } from "drizzle-orm/mysql-core";

export const roles = mysqlTable("roles", {
  key: varchar("key", { length: 255 }).primaryKey(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
});

export const permission = mysqlTable("permission", {
  key: varchar("key", { length: 255 }).primaryKey(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
});

export const rolePermissions = mysqlTable(
  "role_permission",
  {
    roleKey: varchar("role_key", { length: 255 })
      .notNull()
      .references(() => roles.key, { onDelete: "cascade" }),
    permissionKey: varchar("permission_key", { length: 255 })
      .notNull()
      .references(() => permission.key, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleKey, table.permissionKey] }),
  })
);
