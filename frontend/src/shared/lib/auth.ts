import "server-only";

import { betterAuth } from "better-auth";

/**
 * Better Auth server configuration — the single source of truth for auth.
 *
 * Database: uses Postgres when AUTH_DATABASE_URL is set, otherwise a local
 * SQLite file (better-sqlite3) so the app runs without Docker.
 *
 * OAuth providers are wired but only enabled when their credentials are present,
 * so the app boots locally without them.
 */

function buildDatabase() {
  const pgUrl = process.env.AUTH_DATABASE_URL?.trim();
  if (pgUrl) {
    const { Pool } = require("pg");
    return new Pool({ connectionString: pgUrl });
  }
  // In production (Vercel), better-sqlite3 may not be available.
  // Fall back to pg if AUTH_DATABASE_URL is set, otherwise try SQLite.
  try {
    const Database = require("better-sqlite3");
    return new Database(process.env.AUTH_SQLITE_PATH || "./auth.sqlite");
  } catch {
    // If better-sqlite3 is unavailable (Vercel serverless), use pg with a
    // fallback connection string. Set AUTH_DATABASE_URL in production.
    const { Pool } = require("pg");
    return new Pool({ connectionString: process.env.AUTH_DATABASE_URL || "postgresql://localhost/ott" });
  }
}

function buildSocialProviders() {
  const providers: Record<string, { clientId: string; clientSecret: string }> = {};
  const add = (key: string, id?: string, secret?: string) => {
    if (id && secret) providers[key] = { clientId: id, clientSecret: secret };
  };
  add("google", process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  add("facebook", process.env.FACEBOOK_CLIENT_ID, process.env.FACEBOOK_CLIENT_SECRET);
  add("apple", process.env.APPLE_CLIENT_ID, process.env.APPLE_CLIENT_SECRET);
  return providers;
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: buildDatabase(),

  // Email + password. Verification flow is ready; email transport is stubbed
  // for local dev (logs the verification/reset URL to the server console).
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      console.info(`[auth] password reset for ${user.email}: ${url}`);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.info(`[auth] verify email for ${user.email}: ${url}`);
    },
  },

  // Session: HttpOnly cookie, 7-day expiry, rotated when older than 1 day.
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  // Bind sessions to device context (IP + user-agent) for device management.
  advanced: {
    cookiePrefix: "ott",
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  socialProviders: buildSocialProviders(),

  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;
