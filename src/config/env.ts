import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseRefreshTokenDays(): number {
  const raw = process.env.JWT_REFRESH_EXPIRES_IN ?? "28";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 28;
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  /** Short-lived access JWT (e.g. 15m, 1h). */
  JWT_ACCESS_EXPIRES_IN: requireEnv("JWT_EXPIRES_IN"),
  /** Refresh token storage TTL in days (opaque token in DB). */
  JWT_REFRESH_EXPIRES_DAYS: parseRefreshTokenDays(),
  FRONTEND_URL: requireEnv("FRONTEND_URL"),
} as const;
