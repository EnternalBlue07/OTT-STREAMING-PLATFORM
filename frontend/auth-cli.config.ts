/**
 * CLI-only Better Auth config.
 *
 * The real app config lives in `src/shared/lib/auth.ts`, but that file imports
 * `server-only` (a Next.js guard) which the standalone Better Auth CLI cannot
 * load. This file mirrors the database + auth options that affect the schema so
 * `@better-auth/cli migrate` can create/update the tables against the same DB.
 *
 * Keep the database target and any schema-affecting options in sync with
 * `src/shared/lib/auth.ts`.
 */
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { Pool } from "pg";

function buildDatabase() {
  const pgUrl = process.env.AUTH_DATABASE_URL?.trim();
  if (pgUrl) return new Pool({ connectionString: pgUrl });
  return new Database(process.env.AUTH_SQLITE_PATH || "./auth.sqlite");
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "dev-only-secret-change-me-please-32chars-min",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: buildDatabase(),
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
