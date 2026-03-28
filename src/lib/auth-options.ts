import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  findUserByEmail,
  checkPassword,
  findOrCreateGitHubUser,
  restoreUsers,
} from "@/lib/auth-users";
import { decryptUsers } from "@/lib/user-persist";

// Build providers array dynamically
const providers: NextAuthOptions["providers"] = [];

const githubId = process.env.GITHUB_ID ?? "";
const githubSecret = process.env.GITHUB_SECRET ?? "";

if (githubId && githubSecret) {
  providers.push(
    GitHubProvider({
      clientId: githubId,
      clientSecret: githubSecret,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, req) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      // Restore users from encrypted cookie on cold start
      const cookieHeader = req?.headers?.cookie ?? "";
      const match = cookieHeader.match(/naya_users=([^;]+)/);
      if (match?.[1]) {
        try {
          const decoded = decodeURIComponent(match[1]);
          const restored = decryptUsers(decoded);
          if (restored.length > 0) {
            restoreUsers(restored);
          }
        } catch {
          // Cookie corrupted — ignore, fall through to normal lookup
        }
      }

      const email = credentials.email.trim().toLowerCase();
      const user = findUserByEmail(email);

      if (!user) {
        throw new Error("No account found with that email");
      }

      if (!user.passwordHash) {
        throw new Error("This account uses GitHub sign-in");
      }

      const valid = checkPassword(user, credentials.password);
      if (!valid) {
        throw new Error("Invalid email or password");
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        username: user.username,
      };
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/auth/signin",
    newUser: "/onboarding",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        const ghProfile = profile as {
          id: number;
          login: string;
          name: string | null;
          email: string | null;
          avatar_url: string;
        };
        const stored = findOrCreateGitHubUser({
          id: String(ghProfile.id),
          login: ghProfile.login,
          name: ghProfile.name,
          email: ghProfile.email,
          avatar_url: ghProfile.avatar_url,
        });
        (user as any).username = stored.username;
        (user as any).id = stored.id;
      }
      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.username =
          (user as any).username ??
          (profile as any)?.login ??
          user.email?.split("@")[0] ??
          "user";
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      if (account?.provider === "github" && profile) {
        token.username = (profile as any).login ?? token.username;
        token.picture = (profile as any).avatar_url ?? token.picture;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | null;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
