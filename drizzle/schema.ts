import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, primaryKey, unique, varchar, timestamp, index } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const appUser = mysqlTable("app_user", {
	id: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 255 }).notNull().references(() => role.role, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "app_user_id"}),
	unique("users_email_unique").on(table.email),
]);

export const permission = mysqlTable("permission", {
	permission: varchar({ length: 255 }).notNull(),
	displayName: varchar("display_name", { length: 255 }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.permission], name: "permission_permission"}),
]);

export const refreshSessions = mysqlTable("refresh_sessions", {
	id: varchar({ length: 36 }).notNull(),
	userId: varchar("user_id", { length: 255 }).notNull().references(() => appUser.id, { onDelete: "cascade" } ),
	tokenHash: varchar("token_hash", { length: 64 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	index("refresh_sessions_user_id_idx").on(table.userId),
	primaryKey({ columns: [table.id], name: "refresh_sessions_id"}),
	unique("refresh_sessions_token_hash_unique").on(table.tokenHash),
]);

export const role = mysqlTable("role", {
	role: varchar({ length: 255 }).notNull(),
	displayName: varchar("display_name", { length: 255 }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.role], name: "role_role"}),
]);

export const rolePermission = mysqlTable("role_permission", {
	role: varchar({ length: 255 }).notNull().references(() => role.role, { onDelete: "cascade" } ),
	permission: varchar({ length: 255 }).notNull().references(() => permission.permission, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.role, table.permission], name: "role_permission_role_permission"}),
]);
