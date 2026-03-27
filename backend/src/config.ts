try {
  process.loadEnvFile?.("../.env");
} catch {
  // Ignore missing .env in container/runtime environments.
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

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || databaseUrl.trim().length === 0) {
  throw new Error("DATABASE_URL is required");
}

export const config = {
  databaseUrl,
  logLevel: process.env.LOG_LEVEL ?? "info",
  port: parsePort(process.env.PORT),
  staticRoot: process.env.STATIC_ROOT ?? "./public"
};
