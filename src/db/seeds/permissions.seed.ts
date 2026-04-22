import { inArray } from "drizzle-orm";

import { db } from "../index";
import { permission } from "../schema/rbac";

const PERMISSION_DEFINITIONS = [
  { key: "manage_admins", displayName: "Manage Admins" },
  { key: "read_store_inventory", displayName: "Read Store Inventory" },
  { key: "read_shelf_inventory", displayName: "Read Shelf Inventory" },
  { key: "update_store_inventory", displayName: "Update Store Inventory" },
  { key: "update_shelf_inventory", displayName: "Update Shelf Inventory" },
  { key: "approve_stock_request", displayName: "Approve Stock Request" },
  { key: "fulfill_stock_request", displayName: "Fulfill Stock Request" },
  { key: "move_stock_store_to_shelf", displayName: "Move Stock Store To Shelf" },
  { key: "create_stock_request", displayName: "Create Stock Request" },
  { key: "reduce_shelf_stock", displayName: "Reduce Shelf Stock" },
] as const;

export async function seedPermission(): Promise<void> {
  const existing = await db
    .select({ key: permission.key })
    .from(permission)
    .where(
      inArray(
        permission.key,
        PERMISSION_DEFINITIONS.map((permission) => permission.key),
      ),
    );

  const existingKeys = new Set(existing.map((item) => item.key));
  const missingPermissions = PERMISSION_DEFINITIONS.filter(
    (permission) => !existingKeys.has(permission.key),
  );

  if (missingPermissions.length === 0) {
    console.log("Permission seed: all permission already exist.");
    return;
  }

  await db.insert(permission).values(missingPermissions);

  console.log(`Permission seed: inserted ${missingPermissions.length} permissions.`);
}
