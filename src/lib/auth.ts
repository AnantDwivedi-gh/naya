import {
  getServerSession as nextAuthGetServerSession,
  type Session,
} from "next-auth";

// Re-export authOptions from the route to avoid circular deps at build time.
// We inline the import path so the module is only resolved on the server.
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ---------------------------------------------------------------------------
// Extended session types
// ---------------------------------------------------------------------------

export interface NayaUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string;
}

export interface NayaSession extends Session {
  user: NayaUser;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Server-side session getter (use in Server Components / Route Handlers). */
export async function getServerSession(): Promise<NayaSession | null> {
  const session = await nextAuthGetServerSession(authOptions);
  return (session as NayaSession) ?? null;
}

/** Convenience: returns the typed user or null. */
export async function getCurrentUser(): Promise<NayaUser | null> {
  const session = await getServerSession();
  return session?.user ?? null;
}
