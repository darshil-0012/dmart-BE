import { pool } from "../index";
import { seedPermission } from "./permissions.seed";
import { seedProduct } from "./products.seed";
import { seedRolePermissions } from "./role-permissions.seed";
import { seedRoles } from "./roles.seed";
import { seedSectionProduct } from "./section-product.seed";
import { seedSection } from "./section.seed";
import { seedStoreRoom } from "./store-room.seed";

type Seeder = {
  name: string;
  run: () => Promise<void>;
};

const seeders: Seeder[] = [
  { name: "roles", run: seedRoles },
  { name: "permission", run: seedPermission },
  { name: "role_permission", run: seedRolePermissions },
  { name: "product", run: seedProduct },
  { name: "store_room", run: seedStoreRoom },
  { name: "section", run: seedSection },
  { name: "section_product", run: seedSectionProduct },
];

async function runAllSeeders(): Promise<void> {
  for (const seeder of seeders) {
    console.log(`Seeder started: ${seeder.name}`);
    await seeder.run();
    console.log(`Seeder completed: ${seeder.name}`);
  }
}

async function main(): Promise<void> {
  try {
    await runAllSeeders();
    console.log("All seeders completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
