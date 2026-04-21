import { mysqlTable, timestamp, varchar ,int, primaryKey} from "drizzle-orm/mysql-core";
import { user } from "./user";

export const product = mysqlTable(
  "product",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    price: int("price").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
);

export const productRefiller = mysqlTable(
  "product_refiller",
  {
    product: varchar("product", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    refiller: varchar("refiller", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.product, table.refiller] }),
  })
);

