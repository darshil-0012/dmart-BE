import { inArray } from "drizzle-orm";

import { db } from "../index";
import { roles } from "../schema/rbac";

const ROLE_DEFINITIONS = [
  { key: "super_admin", displayName: "Super Admin" },
  { key: "store_head", displayName: "Store Head" },
  { key: "supply_chain_head", displayName: "Supply Chain Head" },
  { key: "refiller", displayName: "Refiller" },
  { key: "billing_person", displayName: "Billing Person" },
] as const;

export async function seedRoles(): Promise<void> {
  const existing = await db
    .select({ key: roles.key })
    .from(roles)
    .where(inArray(roles.key, ROLE_DEFINITIONS.map((role) => role.key)));

  const existingRoles = new Set(existing.map((item) => item.key));
  const missingRoles = ROLE_DEFINITIONS.filter((role) => !existingRoles.has(role.key));

  if (missingRoles.length === 0) {
    console.log("Roles seed: all roles already exist.");
    return;
  }

  await db.insert(roles).values(missingRoles);

  console.log(`Roles seed: inserted ${missingRoles.length} roles.`);
}
