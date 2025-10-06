import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  brand: text("brand"),
  purchaseDate: text("purchase_date"),
  usageCount: integer("usage_count"),
  condition: text("condition"),
  additionalDescription: text("additional_description"),
  basicAccessories: text("basic_accessories").array(),
  otherAccessories: text("other_accessories"),
  features: text("features"),
  originalPrice: text("original_price"),
  sellingPrice: text("selling_price"),
  transactionMethods: text("transaction_methods").array(),
  directLocation: text("direct_location"),
  negotiable: text("negotiable"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
