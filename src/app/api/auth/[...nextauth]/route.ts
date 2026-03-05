/**
 * NextAuth API route handler for App Router.
 *
 * Handles all NextAuth endpoints:
 *   GET  /api/auth/signin
 *   POST /api/auth/signin/:provider
 *   GET  /api/auth/callback/:provider
 *   POST /api/auth/signout
 *   GET  /api/auth/session
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers as any;


