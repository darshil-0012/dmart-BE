import { db } from "../../db";
import { roles } from "../../db/schema/rbac";
import  {type AssignableRole } from "../../types/role";

export async function getUsersByRole(role: AssignableRole) {
  return await db.select().from(roles);
}
