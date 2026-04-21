import { mysqlTable, varchar, timestamp, index } from "drizzle-orm/mysql-core";

import { user } from "./user";
import { product } from "./product";
import { int } from "drizzle-orm/mysql-core";

export const storeRoom = mysqlTable(
  "store_room",
  {
    id:varchar("id", { length: 36 }).primaryKey(),
    productId: varchar("product_id", { length: 36 }).notNull().references(() => product.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),  
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("store_room_product_id_idx").on(table.productId),
  ]
);
