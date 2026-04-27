import { mysqlTable, timestamp, varchar ,int, primaryKey, text} from "drizzle-orm/mysql-core";
import { user } from "./user";

export const product = mysqlTable(
  "product",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    price: int("price").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
);

export const productRefiller = mysqlTable(
  "product_refiller",
  {
    productId: varchar("product", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
      userId: varchar("refiller", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.userId] }),
  })
);

