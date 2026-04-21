import { inArray } from "drizzle-orm";

import { db } from "../index";
import { permission } from "../schema/rbac";

const PERMISSION_DEFINITIONS = [
  { permission: "manage_admins", displayName: "Manage Admins" },
  { permission: "read_store_inventory", displayName: "Read Store Inventory" },
  { permission: "read_shelf_inventory", displayName: "Read Shelf Inventory" },
  { permission: "update_store_inventory", displayName: "Update Store Inventory" },
  { permission: "update_shelf_inventory", displayName: "Update Shelf Inventory" },
  { permission: "approve_stock_request", displayName: "Approve Stock Request" },
  { permission: "fulfill_stock_request", displayName: "Fulfill Stock Request" },
  { permission: "move_stock_store_to_shelf", displayName: "Move Stock Store To Shelf" },
  { permission: "create_stock_request", displayName: "Create Stock Request" },
  { permission: "reduce_shelf_stock", displayName: "Reduce Shelf Stock" },
] as const;

export async function seedPermission(): Promise<void> {
  const existing = await db
    .select({ name: permission.permission })
    .from(permission)
    .where(
      inArray(
        permission.permission,
        PERMISSION_DEFINITIONS.map((permission) => permission.permission),
      ),
    );

  const existingNames = new Set(existing.map((item) => item.name));
  const missingPermissions = PERMISSION_DEFINITIONS.filter(
    (permission) => !existingNames.has(permission.permission),
  );

  if (missingPermissions.length === 0) {
    console.log("Permission seed: all permission already exist.");
    return;
  }

  await db.insert(permission).values(missingPermissions);

  console.log(`Permission seed: inserted ${missingPermissions.length} permissions.`);
}
