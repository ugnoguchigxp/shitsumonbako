import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { config } from "./config.js";
import { closeDb, db, initDb } from "./db.js";
import { logger } from "./logger.js";
import { feedbacks } from "./schema.js";

const createSchema = z.object({
  targetText: z.string().trim().max(200).optional().or(z.literal("")),
  messageText: z.string().trim().min(1).max(5000)
});

const MAX_REQUEST_BODY_BYTES = 10 * 1024;

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.post("/api/feedbacks", async (c) => {
  const rawBody = await c.req.text().catch(() => null);
  if (rawBody === null) {
    return c.json({ error: "Invalid request body" }, 400);
  }

  if (Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BODY_BYTES) {
    return c.json({ error: "Request body too large (max 10KB)" }, 413);
  }

  const body = (() => {
    if (rawBody.length === 0) {
      return null;
    }
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  })();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn({ errors: parsed.error.flatten().fieldErrors }, "invalid feedback submission body");
    return c.json({ error: "Invalid request body" }, 400);
  }

  try {
    const targetText = parsed.data.targetText?.trim();
    const [created] = await db
      .insert(feedbacks)
      .values({
        targetText: targetText && targetText.length > 0 ? targetText : null,
        messageText: parsed.data.messageText.trim()
      })
      .returning();

    return c.json({ data: created }, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "unknown database error";
    logger.error({ errorMessage }, "failed to save feedback to database");
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/api/admin/feedbacks", async (c) => {
  const rows = await db.select().from(feedbacks).orderBy(desc(feedbacks.createdAt));
  return c.json({ data: rows });
});

app.delete("/api/admin/feedbacks/:id", async (c) => {
  const id = Number.parseInt(c.req.param("id"), 10);
  if (!Number.isInteger(id)) {
    return c.json({ error: "Invalid id" }, 400);
  }

  const deleted = await db.delete(feedbacks).where(eq(feedbacks.id, id)).returning({ id: feedbacks.id });

  if (deleted.length === 0) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.body(null, 204);
});

const staticRoot = resolve(config.staticRoot);
const indexHtmlPath = `${staticRoot}/index.html`;

app.use("/*", serveStatic({ root: staticRoot }));

app.get("*", async (c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "Not found" }, 404);
  }
  const html = await readFile(indexHtmlPath, "utf-8");
  return c.html(html);
});

const start = async (): Promise<void> => {
  await initDb();

  const server = serve({
    fetch: app.fetch,
    port: config.port
  });

  logger.info({ port: config.port }, "backend started");

  const shutdown = async () => {
    server.close();
    await closeDb();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

start().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : "unknown startup error";
  logger.error({ errorMessage }, "failed to start backend");
  process.exit(1);
});
