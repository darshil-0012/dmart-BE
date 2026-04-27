import { mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const storeRoom = mysqlTable(
  "store_room",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  }
);
