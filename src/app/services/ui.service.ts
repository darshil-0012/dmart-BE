import { db } from "../../db";
import { roles } from "../../db/schema/rbac";
import { AppError } from "../../utils/appError";
export async function getRoleList() {
  return await db.select().from(roles);
}
