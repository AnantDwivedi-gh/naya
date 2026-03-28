import { NextRequest, NextResponse } from "next/server";
import { validateId } from "@/lib/security/sanitize";

const USE_CONVEX = !!process.env.NEXT_PUBLIC_CONVEX_URL;

async function getConvex() {
  const { convex } = await import("@/lib/convex");
  const { api } = await import("../../../../../../convex/_generated/api");
  return { convex, api };
}

/** Maximum allowed request body size (in bytes). */
const MAX_BODY_SIZE = 10_000;

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/features/:id/deploy
 * Deploy a feature to the user's overlay runtime.
 * Returns the overlay configuration needed by the client runtime.
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
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "userId is required to deploy a feature" },
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

    // Validate optional deviceId
    if (body.deviceId && !validateId(body.deviceId)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "deviceId must be a valid ID format" } },
        { status: 400 }
      );
    }

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();

      // First check that the feature exists and is published
      const feature = await convex.query(api.features.get, { featureId: id });
      if (!feature) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Feature not found" } },
          { status: 404 }
        );
      }
      if (feature.status !== "published") {
        return NextResponse.json(
          {
            success: false,
            error: { code: "NOT_PUBLISHED", message: "Only published features can be deployed" },
          },
          { status: 400 }
        );
      }

      const deploymentId = `deploy_${Date.now().toString(36)}`;

      const result = await convex.mutation(api.features.deploy, {
        featureId: id,
        userId,
        deviceId: body.deviceId || null,
        deploymentId,
      });

      if (!result) {
        return NextResponse.json(
          { success: false, error: { code: "INTERNAL_ERROR", message: "Deployment failed" } },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data: result },
        { status: 201 }
      );
    } else {
      const { getFeature, incrementDeployCount } = await import("@/lib/data/features");
      const { addDeployedFeature } = await import("@/lib/data/users");

      const feature = await getFeature(id);
      if (!feature) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Feature not found" } },
          { status: 404 }
        );
      }
      if (feature.status !== "published") {
        return NextResponse.json(
          {
            success: false,
            error: { code: "NOT_PUBLISHED", message: "Only published features can be deployed" },
          },
          { status: 400 }
        );
      }

      const deploymentId = `deploy_${Date.now().toString(36)}`;
      await incrementDeployCount(id);
      await addDeployedFeature(userId, id);

      return NextResponse.json(
        {
          success: true,
          data: {
            deploymentId,
            featureId: id,
            userId,
            deviceId: body.deviceId || null,
            status: "active",
            deployedAt: new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("POST /api/features/[id]/deploy error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to deploy feature" } },
      { status: 500 }
    );
  }
}
