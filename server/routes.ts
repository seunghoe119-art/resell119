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
      
      if (!input.briefDescription || input.briefDescription.trim() === "") {
        return res.status(400).json({ error: "제품 정보를 입력해주세요" });
      }

      const draft = await generateListingDraft(input);
      res.json({ content: draft });
    } catch (error: any) {
      if (error.message?.includes("API key")) {
        return res.status(500).json({ error: "API 키 설정 오류가 발생했습니다" });
      }
      
      if (error.status === 429) {
        return res.status(429).json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요" });
      }
      
      if (error.status === 401) {
        return res.status(500).json({ error: "API 인증 오류가 발생했습니다" });
      }
      
      if (error.code === "ECONNABORTED") {
        return res.status(504).json({ error: "요청 시간이 초과되었습니다. 다시 시도해주세요" });
      }
      
      res.status(500).json({ error: "AI 초안 생성에 실패했습니다. 다시 시도해주세요" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
