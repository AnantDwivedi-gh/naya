import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * Lightweight user persistence for serverless environments.
 *
 * Stores registered users as an encrypted JSON blob in a cookie.
 * On each request, the cookie is decrypted and users are loaded
 * back into the in-memory store. This survives cold starts without
 * any external database.
 *
 * For production at scale, replace with a real database (Convex, Postgres, etc.)
 */

const ALGORITHM = "aes-256-gcm";
const ENCODING = "base64";

function getKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET || "naya-fallback-secret-key-2024";
  return scryptSync(secret, "naya-user-salt", 32);
}

export function encryptUsers(users: Array<{ id: string; username: string; email: string; name: string; passwordHash: string; image: string | null }>): string {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const json = JSON.stringify(users);
  let encrypted = cipher.update(json, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);
  const authTag = cipher.getAuthTag().toString(ENCODING);

  return `${iv.toString(ENCODING)}.${authTag}.${encrypted}`;
}

export function decryptUsers(data: string): Array<{ id: string; username: string; email: string; name: string; passwordHash: string; image: string | null }> {
  try {
    const [ivStr, authTagStr, encrypted] = data.split(".");
    if (!ivStr || !authTagStr || !encrypted) return [];

    const key = getKey();
    const iv = Buffer.from(ivStr, ENCODING);
    const authTag = Buffer.from(authTagStr, ENCODING);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, ENCODING, "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch {
    return [];
  }
}
