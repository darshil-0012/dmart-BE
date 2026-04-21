import "dotenv/config";

import app from "./app";
import { verifyDatabaseConnection } from "./db";

const PORT = 5000;

async function main(): Promise<void> {
  await verifyDatabaseConnection();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
