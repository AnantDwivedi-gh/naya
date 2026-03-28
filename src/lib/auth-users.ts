import { hashSync, compareSync } from "bcryptjs";

// ---------------------------------------------------------------------------
// In-memory user store (production: swap for Convex/DB)
// ---------------------------------------------------------------------------

export interface StoredUser {
  id: string;
  username: string;
  name: string;
  email: string;
  image: string | null;
  passwordHash: string;
  createdAt: string;
}

const users = new Map<string, StoredUser>();

// Seed demo accounts
const SEED_USERS: StoredUser[] = [
  {
    id: "demo-001",
    username: "demo",
    name: "Demo User",
    email: "demo@naya.app",
    image: null,
    passwordHash: hashSync("Naya@2024!", 10),
    createdAt: new Date().toISOString(),
  },
  {
    id: "creator-001",
    username: "creator",
    name: "Naya Creator",
    email: "creator@naya.app",
    image: null,
    passwordHash: hashSync("Naya@2024!", 10),
    createdAt: new Date().toISOString(),
  },
];

for (const u of SEED_USERS) {
  users.set(u.email.toLowerCase(), u);
}

// ---------------------------------------------------------------------------
// Password validation
// ---------------------------------------------------------------------------

export interface PasswordCheck {
  valid: boolean;
  score: number; // 0-5
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  message: string;
}

export function validatePassword(password: string): PasswordCheck {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const valid = checks.minLength && score >= 4;

  let message = "";
  if (!checks.minLength) message = "At least 8 characters required";
  else if (score < 3) message = "Too weak — add uppercase, numbers, or symbols";
  else if (score < 4) message = "Almost — add one more character type";
  else if (score === 4) message = "Strong password";
  else message = "Very strong password";

  return { valid, score, checks, message };
}

// ---------------------------------------------------------------------------
// Username validation
// ---------------------------------------------------------------------------

export function validateUsername(username: string): { valid: boolean; message: string } {
  if (username.length < 3) return { valid: false, message: "At least 3 characters" };
  if (username.length > 20) return { valid: false, message: "Max 20 characters" };
  if (!/^[a-z0-9._]+$/.test(username)) return { valid: false, message: "Only lowercase, numbers, dots, underscores" };
  if (/^[._]/.test(username) || /[._]$/.test(username)) return { valid: false, message: "Cannot start or end with . or _" };
  if (/[._]{2}/.test(username)) return { valid: false, message: "No consecutive dots or underscores" };

  // Check reserved
  const reserved = ["admin", "naya", "system", "root", "api", "auth", "demo", "test"];
  if (reserved.includes(username)) return { valid: false, message: "Username is reserved" };

  return { valid: true, message: "Available" };
}

// ---------------------------------------------------------------------------
// Email validation
// ---------------------------------------------------------------------------

export function validateEmail(email: string): { valid: boolean; message: string } {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return { valid: false, message: "Invalid email format" };
  return { valid: true, message: "" };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

let userCounter = 2;

export function findUserByEmail(email: string): StoredUser | null {
  return users.get(email.toLowerCase()) ?? null;
}

export function findUserByUsername(username: string): StoredUser | null {
  for (const u of users.values()) {
    if (u.username === username.toLowerCase()) return u;
  }
  return null;
}

export function checkPassword(user: StoredUser, password: string): boolean {
  return compareSync(password, user.passwordHash);
}

export function createUser(data: {
  username: string;
  email: string;
  password: string;
  name?: string;
  image?: string | null;
}): StoredUser {
  const existing = findUserByEmail(data.email);
  if (existing) throw new Error("An account with this email already exists");

  const existingUsername = findUserByUsername(data.username);
  if (existingUsername) throw new Error("Username is taken");

  const pwCheck = validatePassword(data.password);
  if (!pwCheck.valid) throw new Error(pwCheck.message);

  const unCheck = validateUsername(data.username);
  if (!unCheck.valid) throw new Error(unCheck.message);

  const emCheck = validateEmail(data.email);
  if (!emCheck.valid) throw new Error(emCheck.message);

  userCounter++;
  const user: StoredUser = {
    id: `user-${String(userCounter).padStart(3, "0")}`,
    username: data.username.toLowerCase(),
    name: data.name ?? data.username,
    email: data.email.toLowerCase(),
    image: data.image ?? null,
    passwordHash: hashSync(data.password, 10),
    createdAt: new Date().toISOString(),
  };

  users.set(user.email, user);
  return user;
}

export function findOrCreateGitHubUser(profile: {
  id: string;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}): StoredUser {
  // Check if user exists by email
  if (profile.email) {
    const existing = findUserByEmail(profile.email);
    if (existing) return existing;
  }

  // Create new user from GitHub
  userCounter++;
  const user: StoredUser = {
    id: `gh-${profile.id}`,
    username: profile.login.toLowerCase(),
    name: profile.name ?? profile.login,
    email: (profile.email ?? `${profile.login}@github.naya.app`).toLowerCase(),
    image: profile.avatar_url,
    passwordHash: "", // GitHub users don't have a password
    createdAt: new Date().toISOString(),
  };

  users.set(user.email, user);
  return user;
}
