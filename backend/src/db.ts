import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";

import { config } from "./config.js";
import * as schema from "./schema.js";

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10
});

export const db = drizzle(pool, { schema });

export const initDb = async (): Promise<void> => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id SERIAL PRIMARY KEY,
      target_text TEXT,
      message_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS feedbacks_created_at_idx ON feedbacks (created_at DESC);
  `);
};

export const closeDb = async (): Promise<void> => {
  await pool.end();
};
