import { db } from "../../db";
import { roles } from "../../db/schema/rbac";

export async function getRoleList() {
  return await db.select().from(roles);
}
