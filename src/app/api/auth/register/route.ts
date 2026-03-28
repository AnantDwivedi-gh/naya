import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  validatePassword,
  validateUsername,
  validateEmail,
  getAllUsers,
} from "@/lib/auth-users";
import { encryptUsers } from "@/lib/user-persist";

const MAX_BODY_SIZE = 2048;

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: "Request too large" },
        { status: 413 }
      );
    }

    const body = JSON.parse(text);
    const { username, email, password, name } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    const unCheck = validateUsername(username.trim().toLowerCase());
    if (!unCheck.valid) {
      return NextResponse.json(
        { success: false, error: unCheck.message, field: "username" },
        { status: 400 }
      );
    }

    const emCheck = validateEmail(email.trim());
    if (!emCheck.valid) {
      return NextResponse.json(
        { success: false, error: emCheck.message, field: "email" },
        { status: 400 }
      );
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: pwCheck.message,
          field: "password",
          passwordScore: pwCheck.score,
          passwordChecks: pwCheck.checks,
        },
        { status: 400 }
      );
    }

    const user = createUser({
      username: username.trim().toLowerCase(),
      email: email.trim(),
      password,
      name: name?.trim() || undefined,
    });

    // Persist all users to an encrypted cookie so they survive cold starts
    const allUsers = getAllUsers();
    const encrypted = encryptUsers(
      allUsers.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        passwordHash: u.passwordHash,
        image: u.image,
      }))
    );

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });

    // Set encrypted user store cookie (httpOnly, secure, 30 days)
    response.cookies.set("naya_users", encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
