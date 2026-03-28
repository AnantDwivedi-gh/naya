import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, validateId } from "@/lib/security/sanitize";

const USE_CONVEX = !!process.env.NEXT_PUBLIC_CONVEX_URL;

async function getConvex() {
  const { convex } = await import("@/lib/convex");
  const { api } = await import("../../../../../../convex/_generated/api");
  return { convex, api };
}

/** Maximum allowed request body size (in bytes). */
const MAX_BODY_SIZE = 5_000;

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/features/:id/fork
 * Fork an existing feature. Creates a copy under the requesting user's account.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // --- Request size guard --------------------------------------------------
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: "PAYLOAD_TOO_LARGE", message: "Request body exceeds size limit" } },
        { status: 413 }
      );
    }

    const { id } = await context.params;

    if (!validateId(id)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid feature ID format" } },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const userId = body.userId || request.headers.get("x-user-id");
    const userName = body.userName || request.headers.get("x-user-name");

    if (!userId || !userName) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "userId and userName are required to fork a feature",
          },
        },
        { status: 400 }
      );
    }

    if (!validateId(userId)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "userId must be a valid ID format" } },
        { status: 400 }
      );
    }

    const sanitizedUserName = sanitizeInput(userName, 100);

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();
      const newFeatureId = `feat_${Date.now().toString(36)}`;

      const forked = await convex.mutation(api.features.fork, {
        featureId: id,
        userId,
        userName: sanitizedUserName,
        newFeatureId,
      });

      if (!forked) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Feature not found" } },
          { status: 404 }
        );
      }

      await convex.mutation(api.users.addFeature, {
        userId,
        featureId: newFeatureId,
      });

      return NextResponse.json({ success: true, data: forked }, { status: 201 });
    } else {
      const { forkFeature } = await import("@/lib/data/features");
      const { addFeatureToUser } = await import("@/lib/data/users");

      const forked = await forkFeature(id, userId, sanitizedUserName);

      if (!forked) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Feature not found" } },
          { status: 404 }
        );
      }

      await addFeatureToUser(userId, forked.id);

      return NextResponse.json({ success: true, data: forked }, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/features/[id]/fork error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fork feature" } },
      { status: 500 }
    );
  }
}
