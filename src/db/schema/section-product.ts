import { index, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

import { product } from "./product";
import { section } from "./section";

export const sectionProduct = mysqlTable(
  "section_product",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sectionId: varchar("section_id", { length: 36 })
      .notNull()
      .references(() => section.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .unique()
      .references(() => product.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("section_product_section_id_idx").on(table.sectionId),
    index("section_product_product_id_idx").on(table.productId),
  ]
);
