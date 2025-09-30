import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema } from "@shared/schema";
import { generateListingDraft, type GenerateDraftInput } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/posts", async (_req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const updateSchema = insertPostSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const post = await storage.updatePost(req.params.id, validatedData);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: "Failed to update post" });
    }
  });

  app.post("/api/generate-draft", async (req, res) => {
    try {
      const input: GenerateDraftInput = req.body;
      
      if (!input.productName || input.productName.trim() === "") {
        return res.status(400).json({ error: "제품명은 필수입니다" });
      }

      const draft = await generateListingDraft(input);
      res.json(draft);
    } catch (error: any) {
      console.error("AI draft generation error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: error.message || "AI 초안 생성 실패" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
