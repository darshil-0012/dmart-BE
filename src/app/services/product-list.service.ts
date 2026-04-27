import { db } from "../../db";
import { sectionProduct } from "../../db/schema";

export async function getProductList() {
  return await db.select().from(sectionProduct);
}
