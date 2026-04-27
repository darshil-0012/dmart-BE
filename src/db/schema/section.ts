import { index, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { storeRoom } from "./store-room";

export const section = mysqlTable(
  "section",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    storeRoomId: varchar("store_room_id", { length: 36 })
      .notNull()
      .references(() => storeRoom.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("section_store_room_id_idx").on(table.storeRoomId)]
);
