import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: serial().primaryKey(),
  roomId: text("room_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
