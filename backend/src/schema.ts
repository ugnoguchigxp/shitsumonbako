import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  targetText: text("target_text"),
  messageText: text("message_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
