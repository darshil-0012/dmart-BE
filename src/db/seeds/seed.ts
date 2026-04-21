import { pool } from "../index";
import { seedPermission } from "./permissions.seed";
import { seedRolePermissions } from "./role-permissions.seed";
import { seedRoles } from "./roles.seed";

type Seeder = {
  name: string;
  run: () => Promise<void>;
};

const seeders: Seeder[] = [
  { name: "roles", run: seedRoles },
  { name: "permission", run: seedPermission },
  { name: "role_permission", run: seedRolePermissions },
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
