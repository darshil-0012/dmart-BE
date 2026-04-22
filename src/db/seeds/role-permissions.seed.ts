import { db } from "../index";
import { rolePermissions } from "../schema/rbac";
import { Role } from "../../types/role";

const ROLE_PERMISSION_MAP = {
  [Role.SUPER_ADMIN]: ["manage_admins"],
  [Role.STORE_HEAD]: [
    "read_store_inventory",
    "read_shelf_inventory",
    "update_store_inventory",
    "update_shelf_inventory",
    "approve_stock_request",
  ],
  [Role.SUPPLY_CHAIN_HEAD]: ["fulfill_stock_request"],
  [Role.REFILLER]: [
    "read_store_inventory",
    "read_shelf_inventory",
    "move_stock_store_to_shelf",
    "create_stock_request",
  ],
  [Role.BILLING_PERSON]: [
    "read_store_inventory",
    "read_shelf_inventory",
    "reduce_shelf_stock",
  ],
} as const;

export async function seedRolePermissions(): Promise<void> {
  const existing = await db
    .select({
      roleKey: rolePermissions.roleKey,
      permissionKey: rolePermissions.permissionKey,
    })
    .from(rolePermissions);

  const existingPairs = new Set(
    existing.map((item) => `${item.roleKey}::${item.permissionKey}`),
  );

  const missingMappings = Object.entries(ROLE_PERMISSION_MAP).flatMap(
    ([role, permissions]) =>
      permissions
        .filter((permission) => !existingPairs.has(`${role}::${permission}`))
        .map((permission) => ({
          roleKey: role,
          permissionKey: permission,
        })),
  );

  if (missingMappings.length === 0) {
    console.log("Role permissions seed: all mappings already exist.");
    return;
  }

  await db.insert(rolePermissions).values(missingMappings);

  console.log(
    `Role permissions seed: inserted ${missingMappings.length} mappings.`,
  );
}
