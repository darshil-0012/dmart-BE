import { db } from "../../db";
import { roles } from "../../db/schema/rbac";
import { user } from "../../db/schema/user";
import  {type AssignableRole } from "../../types/role";
import { eq, inArray, sql } from "drizzle-orm";

export async function getUsersByRole(role: AssignableRole) {
  return await db.select().from(user).innerJoin(roles, eq(user.roleKey, roles.key)).where(eq(roles.key, role));
}
