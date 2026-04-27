import { eq } from "drizzle-orm";
import { db } from "../../db";
import {
  product,
  productRefiller,
  section,
  sectionProduct,
  user,
} from "../../db/schema";

export async function getProductListFromStoreRoomSection() {
  return db
    .select({
      product: {
        id: product.id,
        name: product.name,
        quantity: sectionProduct.quantity,
        price: product.price,
      },
      refiller: {
        id: user.id,
        name: user.name,
      },
      section: {
        id: section.id,
        name: section.name,
      },
    })
    .from(product)
    .leftJoin(sectionProduct, eq(sectionProduct.productId, product.id))
    .leftJoin(section, eq(section.id, sectionProduct.sectionId))
    .leftJoin(productRefiller, eq(productRefiller.productId, product.id))
    .leftJoin(user, eq(user.id, productRefiller.userId));
}
