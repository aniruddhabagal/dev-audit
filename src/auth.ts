/**
 * NextAuth.js v5 configuration for DevAudit.
 *
 * Auth flow:
 *   1. User clicks "Sign in with GitHub" → NextAuth redirects to GitHub OAuth
 *   2. GitHub redirects back with `code` → NextAuth receives it
 *   3. In the `signIn` callback, we forward the code to our backend
 *      (GET /api/v1/auth/github/callback?code=) to get a backend JWT
 *   4. Backend JWT is stored in the NextAuth session for API calls
 */

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      // On first sign-in, exchange the GitHub code/access_token for our backend JWT
      if (account?.access_token) {
        try {
          // Call our backend to exchange the GitHub token for a DevAudit JWT
          const res = await fetch(
            `${BACKEND_URL}/api/v1/auth/github/callback?code=${account.access_token}`,
            { method: "GET" }
          );

          if (res.ok) {
            const data = await res.json();
            token.backendToken = data.access_token;
          }
        } catch (error) {
          console.error("Failed to exchange token with backend:", error);
        }

        // Store GitHub profile info
        token.githubAccessToken = account.access_token;
      }

      return token;
    },

    async session({ session, token }) {
      // Expose backend JWT and GitHub info to the client session
      (session as any).backendToken = token.backendToken as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: "/",
  },
});
