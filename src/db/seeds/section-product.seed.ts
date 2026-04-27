import crypto from "node:crypto";

import { db } from "../index";
import { product } from "../schema/product";
import { sectionProduct } from "../schema/section-product";
import { section } from "../schema/section";

export async function seedSectionProduct(): Promise<void> {
  const sections = await db
    .select({ id: section.id, location: section.location })
    .from(section)
    .orderBy(section.location);

  if (sections.length === 0) {
    console.log("Section product seed: no sections found. Run section seed first.");
    return;
  }

  const products = await db
    .select({ id: product.id })
    .from(product)
    .orderBy(product.name);

  if (products.length === 0) {
    console.log("Section product seed: no products found. Run product seed first.");
    return;
  }

  const existing = await db
    .select({ productId: sectionProduct.productId })
    .from(sectionProduct);
  const existingProductIds = new Set(existing.map((item) => item.productId));

  const missingSectionProducts = products
    .filter((item) => !existingProductIds.has(item.id))
    .map((item, index) => {
      const targetSection = sections[index % sections.length];
      return {
        id: crypto.randomUUID(),
        sectionId: targetSection.id,
        productId: item.id,
        quantity: 20 + ((index % 7) * 5),
      };
    });

  if (missingSectionProducts.length === 0) {
    console.log("Section product seed: all products already mapped to sections.");
    return;
  }

  await db.insert(sectionProduct).values(missingSectionProducts);

  console.log(
    `Section product seed: inserted ${missingSectionProducts.length} section mappings.`,
  );
}
