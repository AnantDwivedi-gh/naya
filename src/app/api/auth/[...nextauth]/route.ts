import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  findUserByEmail,
  checkPassword,
  findOrCreateGitHubUser,
} from "@/lib/auth-users";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
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
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
        };
      },
    }),
  ],

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
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
