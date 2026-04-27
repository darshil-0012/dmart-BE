import crypto from "node:crypto";
import { inArray } from "drizzle-orm";

import { db } from "../index";
import { storeRoom } from "../schema/store-room";

const STORE_ROOM_DEFINITIONS = [
  {
    name: "Main Storage A",
    description: "Primary store room for daily high-demand products",
  },
  {
    name: "Bulk Storage B",
    description: "Secondary store room for bulk grocery and backup stock",
  },
  {
    name: "Quick Refill C",
    description: "Fast moving items store room for shelf refill operations",
  },
] as const;

export async function seedStoreRoom(): Promise<void> {
  const existing = await db
    .select({ name: storeRoom.name })
    .from(storeRoom)
    .where(
      inArray(
        storeRoom.name,
        STORE_ROOM_DEFINITIONS.map((item) => item.name),
      ),
    );

  const existingNames = new Set(existing.map((item) => item.name));
  const missingStoreRooms = STORE_ROOM_DEFINITIONS.filter(
    (item) => !existingNames.has(item.name),
  ).map((item) => ({
    id: crypto.randomUUID(),
    ...item,
  }));

  if (missingStoreRooms.length === 0) {
    console.log("Store room seed: all store rooms already exist.");
    return;
  }

  await db.insert(storeRoom).values(missingStoreRooms);

  console.log(`Store room seed: inserted ${missingStoreRooms.length} store rooms.`);
}
