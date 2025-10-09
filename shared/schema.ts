
import { sql } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, integer, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("resell_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  productName: text("product_name").notNull(),
  brand: text("brand"),
  purchaseDate: text("purchase_date"),
  usageCount: integer("usage_count"),
  condition: text("condition"),
  conditionNote: text("condition_note"),
  baseItems: text("base_items").array(),
  extraItems: text("extra_items").array(),
  features: text("features").array(),
  purchasePrice: integer("purchase_price"),
  askingPrice: integer("asking_price"),
  tradeTypes: text("trade_types").array(),
  tradeArea: text("trade_area"),
  nego: text("nego"),
  aiDraft: text("ai_draft"),
  pendingDraft: text("pending_draft"),
  finalDraft: text("final_draft"),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
