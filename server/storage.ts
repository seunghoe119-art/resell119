import { type Post, type InsertPost } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getPosts(): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined>;
}

export class MemStorage implements IStorage {
  private posts: Map<string, Post>;

  constructor() {
    this.posts = new Map();
  }

  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      id,
      productName: insertPost.productName,
      brand: insertPost.brand ?? null,
      purchaseDate: insertPost.purchaseDate ?? null,
      usageCount: insertPost.usageCount ?? null,
      condition: insertPost.condition ?? null,
      additionalDescription: insertPost.additionalDescription ?? null,
      basicAccessories: insertPost.basicAccessories ?? null,
      otherAccessories: insertPost.otherAccessories ?? null,
      features: insertPost.features ?? null,
      originalPrice: insertPost.originalPrice ?? null,
      sellingPrice: insertPost.sellingPrice ?? null,
      transactionMethods: insertPost.transactionMethods ?? null,
      directLocation: insertPost.directLocation ?? null,
      negotiable: insertPost.negotiable ?? null,
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updateData: Partial<InsertPost>): Promise<Post | undefined> {
    const existingPost = this.posts.get(id);
    if (!existingPost) return undefined;

    const updatedPost: Post = {
      ...existingPost,
      ...updateData,
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }
}

export const storage = new MemStorage();
