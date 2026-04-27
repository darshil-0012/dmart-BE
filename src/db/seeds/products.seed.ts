import crypto from "node:crypto";
import { inArray } from "drizzle-orm";

import { db } from "../index";
import { product } from "../schema/product";

const PRODUCT_DEFINITIONS = [
  {
    name: "Dove Shampoo 200ml",
    description: "Dove Shampoo 200ml",
    price: 99,
  },
  {
    name: "Tata Salt 1kg",
    description: "Tata Salt 1kg",
    price: 22,
  },
  {
    name: "Surf Excel Detergent 500g",
    description: "Surf Excel Detergent 500g",
    price: 55,
  },
  {
    name: "Amul Butter 100g",
    description: "Amul Butter 100g",
    price: 56,
  },
  {
    name: "Parle-G Biscuits 800g",
    description: "Parle-G Biscuits 800g",
    price: 45,
  },
] as const;

export async function seedProduct(): Promise<void> {
  const existing = await db
    .select({ name: product.name })
    .from(product)
    .where(
      inArray(
        product.name,
        PRODUCT_DEFINITIONS.map((item) => item.name)
      )
    );

  const existingNames = new Set(existing.map((item) => item.name));
  const missingProducts = PRODUCT_DEFINITIONS.filter(
    (item) => !existingNames.has(item.name)
  ).map((item) => ({
    id: crypto.randomUUID(),
    ...item,
  }));

  if (missingProducts.length === 0) {
    console.log("Products seed: all products already exist.");
    return;
  }

  await db.insert(product).values(missingProducts);

  console.log(`Products seed: inserted ${missingProducts.length} products.`);
}
