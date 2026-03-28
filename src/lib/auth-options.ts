import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  findUserByEmail,
  checkPassword,
  findOrCreateGitHubUser,
} from "@/lib/auth-users";

// Build the providers array dynamically — only include GitHub if configured
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
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/signin",
    newUser: "/onboarding",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // GitHub: find or create user in our store
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
        // Attach stored user data
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
        // Ensure name, email, image are always carried through
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | null;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
