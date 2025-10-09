
import { sql } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, integer, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("resell_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  productName: text("product_name").notNull(),
  brand: text("brand"),
  purchaseDate: date("purchase_date"),
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
  fields: jsonb("fields"),
});

export const insertPostSchema = createInsertSchema(posts, {
  purchaseDate: z.union([z.string(), z.date()]).nullable(),
  usageCount: z.number().nullable(),
  condition: z.string().nullable(),
  conditionNote: z.string().nullable(),
  baseItems: z.array(z.string()).nullable(),
  extraItems: z.array(z.string()).nullable(),
  features: z.array(z.string()).nullable(),
  purchasePrice: z.number().nullable(),
  askingPrice: z.number().nullable(),
  tradeTypes: z.array(z.string()).nullable(),
  tradeArea: z.string().nullable(),
  nego: z.string().nullable(),
  aiDraft: z.string().nullable(),
  pendingDraft: z.string().nullable(),
  finalDraft: z.string().nullable(),
  fields: z.any().nullable(),
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
