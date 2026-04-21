import { relations } from "drizzle-orm/relations";
import { role, appUser, refreshSessions, permission, rolePermission } from "./schema";

export const appUserRelations = relations(appUser, ({one, many}) => ({
	role: one(role, {
		fields: [appUser.role],
		references: [role.role]
	}),
	refreshSessions: many(refreshSessions),
}));

export const roleRelations = relations(role, ({many}) => ({
	appUsers: many(appUser),
	rolePermissions: many(rolePermission),
}));

export const refreshSessionsRelations = relations(refreshSessions, ({one}) => ({
	appUser: one(appUser, {
		fields: [refreshSessions.userId],
		references: [appUser.id]
	}),
}));

export const rolePermissionRelations = relations(rolePermission, ({one}) => ({
	permission: one(permission, {
		fields: [rolePermission.permission],
		references: [permission.permission]
	}),
	role: one(role, {
		fields: [rolePermission.role],
		references: [role.role]
	}),
}));

export const permissionRelations = relations(permission, ({many}) => ({
	rolePermissions: many(rolePermission),
}));