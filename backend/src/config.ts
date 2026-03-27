try {
  process.loadEnvFile?.("../.env");
} catch {
  // Ignore when .env does not exist.
}

try {
  process.loadEnvFile?.(".env");
} catch {
  // Ignore when .env does not exist.
}

const parsePort = (value: string | undefined): number => {
  const fallback = 8787;
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 65535) {
    return fallback;
  }
  return parsed;
};

const fallbackDatabaseUrl = "postgresql://quickquestion:quickquestion@localhost:5433/quickquestion";
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl || databaseUrl.length === 0) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required");
  }
  console.warn(
    `DATABASE_URL is not set. Using local fallback: ${fallbackDatabaseUrl}`
  );
}

export const config = {
  databaseUrl: databaseUrl && databaseUrl.length > 0 ? databaseUrl : fallbackDatabaseUrl,
  logLevel: process.env.LOG_LEVEL ?? "info",
  port: parsePort(process.env.PORT),
  staticRoot: process.env.STATIC_ROOT ?? "./public"
};
