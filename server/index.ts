import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  const server = app.listen({
    port: 5000,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port 5000`);
  });

  // Setup vite in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();
