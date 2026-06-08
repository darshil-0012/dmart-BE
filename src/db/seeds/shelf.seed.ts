import crypto from "node:crypto";
import { inArray } from "drizzle-orm";

import { db } from "../index";
import { product } from "../schema/product";
import { shelf } from "../schema/shelf";

// Location format: {floor}-{section}-{line}-{lineSection}-{level}
// Example: 1-A-1-13-1
// floor: 1 fixed, section: A, line: 1, lineSection: 1-13, level: 1-5 (bottom→top)
function generateLocation(index: number): string {
  const floor = 1;
  const section = "A";
  const line = 1;
  const lineSection = Math.floor(index / 5) + 1;
  const level = (index % 5) + 1;
  return `${floor}-${section}-${line}-${lineSection}-${level}`;
}

export async function seedShelf(): Promise<void> {
  const allProducts = await db.select({ id: product.id }).from(product);

  if (allProducts.length === 0) {
    console.log("Shelf seed: no products found, skipping.");
    return;
  }

  const existingShelves = await db
    .select({ productId: shelf.productId })
    .from(shelf)
    .where(
      inArray(
        shelf.productId,
        allProducts.map((p) => p.id)
      )
    );

  const seededProductIds = new Set(existingShelves.map((s) => s.productId));
  const unseededProducts = allProducts.filter(
    (p) => !seededProductIds.has(p.id)
  );

  if (unseededProducts.length === 0) {
    console.log("Shelf seed: all products already have shelf entries.");
    return;
  }

  // Determine starting index so locations don't collide with already-seeded ones
  const startIndex = allProducts.length - unseededProducts.length;

  const shelfEntries = unseededProducts.map((p, i) => ({
    id: crypto.randomUUID(),
    productId: p.id,
    location: generateLocation(startIndex + i),
    quantity: 0,
  }));

  await db.insert(shelf).values(shelfEntries);

  console.log(`Shelf seed: inserted ${shelfEntries.length} shelf entries.`);
}
