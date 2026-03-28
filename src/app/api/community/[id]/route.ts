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
 * GET /api/community/:id
 * Retrieve a single community with its features and polls.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!validateId(id)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid community ID format" } },
        { status: 400 }
      );
    }

    let result;
    if (USE_CONVEX) {
      const { convex, api } = await getConvex();
      result = await convex.query(api.communities.get, { communityId: id });
    } else {
      const { getCommunity } = await import("@/lib/data/communities");
      result = await getCommunity(id);
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Community not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET /api/community/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch community" } },
      { status: 500 }
    );
  }
}
