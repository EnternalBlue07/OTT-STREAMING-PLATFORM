import { auth } from "@/shared/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/** Better Auth mounts all auth routes (signup, login, OAuth, verify, reset,
 *  sessions, revoke) under /api/auth/*. */
export const { GET, POST } = toNextJsHandler(auth);
