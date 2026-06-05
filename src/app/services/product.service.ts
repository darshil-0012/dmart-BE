import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db";
import {
  product,
  productRefiller,
  section,
  sectionProduct,
  user,
} from "../../db/schema";
import { AppError } from "../../utils/appError";
import { ROLES } from "../../types/role";

export async function getProductList() {
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

export async function updateProductRefiller(productId: string, userIds: string[]) {
  const foundUsers = await db
    .select({ id: user.id, roleKey: user.roleKey })
    .from(user)
    .where(inArray(user.id, userIds));

  if (foundUsers.length !== userIds.length) {
    throw AppError.notFound("One or more users not found");
  }

  const nonRefillers = foundUsers.filter((u) => u.roleKey !== ROLES.REFILLER);
  if (nonRefillers.length > 0) {
    throw AppError.badRequest("One or more users are not refillers");
  }

  const productExists = await db
    .select({ id: product.id })
    .from(product)
    .where(eq(product.id, productId))
    .limit(1);

  if (productExists.length === 0) {
    throw AppError.notFound("Product");
  }

  return await db.transaction(async (tx) => {
    await tx.delete(productRefiller).where(eq(productRefiller.productId, productId));
    return tx
      .insert(productRefiller)
      .values(userIds.map((userId) => ({ productId, userId })));
  });
}

export async function setProductRefillerByUserId(productIds: string[], userId: string) {
  const userExists = await db
    .select({ id: user.id, roleKey: user.roleKey })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (userExists.length === 0) {
    throw AppError.notFound("User");
  }

  if (userExists[0].roleKey !== ROLES.REFILLER) {
    throw AppError.badRequest("User is not a refiller");
  }

  const foundProducts = await db
    .select({ id: product.id })
    .from(product)
    .where(inArray(product.id, productIds));

  if (foundProducts.length !== productIds.length) {
    throw AppError.notFound("One or more products not found");
  }

  return await db
    .insert(productRefiller)
    .values(productIds.map((productId) => ({ productId, userId })))
    .onDuplicateKeyUpdate({ set: { userId: sql`VALUES(refiller)` } });
}
