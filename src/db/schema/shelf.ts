import {
  mysqlTable,
  primaryKey,
  varchar,
  int,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { product } from "./product";

export const shelf = mysqlTable(
  "shelf",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => product.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("shelf_product_id_idx").on(table.productId)]
);

