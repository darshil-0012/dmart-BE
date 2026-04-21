import { inArray } from "drizzle-orm";

import { db } from "../index";
import { roles } from "../schema/rbac";

const ROLE_DEFINITIONS = [
  { role: "super_admin", displayName: "Super Admin" },
  { role: "store_head", displayName: "Store Head" },
  { role: "supply_chain_head", displayName: "Supply Chain Head" },
  { role: "refiller", displayName: "Refiller" },
  { role: "billing_person", displayName: "Billing Person" },
] as const;

export async function seedRoles(): Promise<void> {
  const existing = await db
    .select({ role: roles.role })
    .from(roles)
    .where(inArray(roles.role, ROLE_DEFINITIONS.map((role) => role.role)));

  const existingRoles = new Set(existing.map((item) => item.role));
  const missingRoles = ROLE_DEFINITIONS.filter((role) => !existingRoles.has(role.role));

  if (missingRoles.length === 0) {
    console.log("Roles seed: all roles already exist.");
    return;
  }

  await db.insert(roles).values(missingRoles);

  console.log(`Roles seed: inserted ${missingRoles.length} roles.`);
}
