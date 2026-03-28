import { NextRequest, NextResponse } from "next/server";
import { validateId } from "@/lib/security/sanitize";

const USE_CONVEX = !!process.env.NEXT_PUBLIC_CONVEX_URL;

async function getConvex() {
  const { convex } = await import("@/lib/convex");
  const { api } = await import("../../../../../convex/_generated/api");
  return { convex, api };
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/:id
 * Retrieve a user profile with their authored features.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!validateId(id)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid user ID format" } },
        { status: 400 }
      );
    }

    let result;
    if (USE_CONVEX) {
      const { convex, api } = await getConvex();
      result = await convex.query(api.users.get, { userId: id });
    } else {
      const { getUser } = await import("@/lib/data/users");
      result = await getUser(id);
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch user" } },
      { status: 500 }
    );
  }
}
