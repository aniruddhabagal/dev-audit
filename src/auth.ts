/**
 * NextAuth.js v5 configuration for DevAudit.
 *
 * Auth flow:
 *   1. User clicks "Sign in with GitHub" → NextAuth redirects to GitHub OAuth
 *   2. GitHub redirects back with `code` → NextAuth exchanges it for an access_token
 *   3. In the `jwt` callback, we POST the access_token to our backend
 *      (POST /api/v1/auth/token-exchange) to get a DevAudit JWT
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
      // On first sign-in, exchange the GitHub access_token for our backend JWT
      if (account?.access_token) {
        try {
          const res = await fetch(
            `${BACKEND_URL}/api/v1/auth/token-exchange`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                github_access_token: account.access_token,
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            token.backendToken = data.access_token;
          } else {
            const errBody = await res.text();
            console.error("Backend token exchange failed:", res.status, errBody);
          }
        } catch (error) {
          console.error("Failed to exchange token with backend:", error);
        }

        // Store GitHub access token for direct GitHub API calls if needed
        token.githubAccessToken = account.access_token;
      }

      return token;
    },

    async session({ session, token }) {
      // Expose backend JWT to the client session
      (session as any).backendToken = token.backendToken as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: "/",
  },
});
