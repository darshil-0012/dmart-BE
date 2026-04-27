import crypto from "node:crypto";
import { inArray } from "drizzle-orm";

import { db } from "../index";
import { section } from "../schema/section";
import { storeRoom } from "../schema/store-room";

const SECTION_DEFINITIONS = [
  {
    storeRoomName: "Main Storage A",
    name: "Main Grocery Lane",
    location: "A-A-1-1",
    description: "Staples and daily essentials",
  },
  {
    storeRoomName: "Main Storage A",
    name: "Snacks and Beverages Lane",
    location: "A-A-2-1",
    description: "Snacks, soft drinks and ready to eat products",
  },
  {
    storeRoomName: "Main Storage A",
    name: "Personal Care Lane",
    location: "A-B-3-2",
    description: "Toiletries, skin care and hygiene products",
  },
  {
    storeRoomName: "Main Storage A",
    name: "Cleaning Supplies Lane",
    location: "A-B-4-1",
    description: "Floor cleaners, detergent and disinfectants",
  },
  {
    storeRoomName: "Bulk Storage B",
    name: "Bulk Grains Lane",
    location: "A-C-11-3",
    description: "Rice, atta, dal and large package products",
  },
  {
    storeRoomName: "Bulk Storage B",
    name: "Oil and Masala Lane",
    location: "A-C-12-2",
    description: "Cooking oils, spices and condiments",
  },
  {
    storeRoomName: "Bulk Storage B",
    name: "Breakfast and Dairy Lane",
    location: "A-D-13-4",
    description: "Tea, coffee, cereals and dairy products",
  },
  {
    storeRoomName: "Bulk Storage B",
    name: "Cookies and Instant Mix Lane",
    location: "A-D-14-2",
    description: "Biscuits, cookies and ready mixes",
  },
  {
    storeRoomName: "Quick Refill C",
    name: "Refill Fast Moving Lane 1",
    location: "A-E-21-1",
    description: "Frequently refilled shelf items",
  },
  {
    storeRoomName: "Quick Refill C",
    name: "Refill Fast Moving Lane 2",
    location: "A-E-22-2",
    description: "Top moving personal and household products",
  },
  {
    storeRoomName: "Quick Refill C",
    name: "Refill Fast Moving Lane 3",
    location: "A-A-23-4",
    description: "Chips, drinks and impulse purchase products",
  },
  {
    storeRoomName: "Quick Refill C",
    name: "Refill Fast Moving Lane 4",
    location: "A-F-24-3",
    description: "Emergency reserve and promo products",
  },
] as const;

export async function seedSection(): Promise<void> {
  const storeRoomNames = [...new Set(SECTION_DEFINITIONS.map((item) => item.storeRoomName))];

  const storeRooms = await db
    .select({ id: storeRoom.id, name: storeRoom.name })
    .from(storeRoom)
    .where(inArray(storeRoom.name, storeRoomNames));

  const storeRoomIdByName = new Map(storeRooms.map((item) => [item.name, item.id]));
  const missingStoreRoomNames = storeRoomNames.filter((name) => !storeRoomIdByName.has(name));

  if (missingStoreRoomNames.length > 0) {
    console.log(
      `Section seed: missing store rooms (${missingStoreRoomNames.join(", ")}). Run store room seed first.`,
    );
    return;
  }

  const existing = await db
    .select({ location: section.location })
    .from(section)
    .where(
      inArray(
        section.location,
        SECTION_DEFINITIONS.map((item) => item.location),
      ),
    );

  const existingLocations = new Set(existing.map((item) => item.location));
  const missingSections = SECTION_DEFINITIONS.filter(
    (item) => !existingLocations.has(item.location),
  ).map((item) => ({
    id: crypto.randomUUID(),
    storeRoomId: storeRoomIdByName.get(item.storeRoomName)!,
    name: item.name,
    location: item.location,
    description: item.description,
  }));

  if (missingSections.length === 0) {
    console.log("Section seed: all sections already exist.");
    return;
  }

  await db.insert(section).values(missingSections);

  console.log(`Section seed: inserted ${missingSections.length} sections.`);
}
