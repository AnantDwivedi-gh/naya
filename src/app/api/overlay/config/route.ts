import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, validateId } from "@/lib/security/sanitize";

const USE_CONVEX = !!process.env.NEXT_PUBLIC_CONVEX_URL;

async function getConvex() {
  const { convex } = await import("@/lib/convex");
  const { api } = await import("../../../../../convex/_generated/api");
  return { convex, api };
}

/**
 * GET /api/overlay/config
 * Returns overlay configurations for all features deployed by the requesting user.
 * The overlay runtime calls this on startup to know what to inject and where.
 *
 * Query params:
 *   userId:    string -- the user whose deployments to return (or x-user-id header)
 *   targetApp: string -- optional, filter configs for a specific app domain
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "userId query param or x-user-id header is required" },
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

    const targetApp = searchParams.get("targetApp");
    const sanitizedTargetApp = targetApp ? sanitizeInput(targetApp, 200) : null;

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();

      // Get the user with their features
      const userResult = await convex.query(api.users.get, { userId });
      if (!userResult) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
          { status: 404 }
        );
      }

      // Build overlay configs for each deployed feature
      const configs = [];

      for (const featureId of userResult.deployedFeatureIds) {
        const feature = await convex.query(api.features.get, { featureId });
        if (!feature) continue;
        if (feature.status !== "published") continue;

        // If filtering by target app, skip non-matching
        if (sanitizedTargetApp && !feature.targetApp.includes(sanitizedTargetApp)) continue;

        configs.push({
          featureId: feature.featureId,
          featureName: feature.name,
          targetApp: feature.targetApp,
          enabled: true,
          code: feature.code,
          triggerConditions: feature.triggerConditions,
          integrationHooks: feature.integrationHooks,
          permissions: feature.permissions,
          userSettings: {},
        });
      }

      return NextResponse.json({
        success: true,
        data: configs,
        meta: {
          userId,
          totalDeployed: configs.length,
          targetApp: sanitizedTargetApp || "all",
        },
      });
    } else {
      const { getUser } = await import("@/lib/data/users");
      const { getFeature } = await import("@/lib/data/features");

      // Get the user with their features
      const userResult = await getUser(userId);
      if (!userResult) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
          { status: 404 }
        );
      }

      // Build overlay configs for each deployed feature
      const configs = [];

      for (const featureId of userResult.deployedFeatureIds) {
        const feature = await getFeature(featureId);
        if (!feature) continue;
        if (feature.status !== "published") continue;

        // If filtering by target app, skip non-matching
        if (sanitizedTargetApp && !feature.targetApp.includes(sanitizedTargetApp)) continue;

        configs.push({
          featureId: feature.id,
          featureName: feature.name,
          targetApp: feature.targetApp,
          enabled: true,
          code: feature.code,
          triggerConditions: feature.triggerConditions,
          integrationHooks: feature.integrationHooks,
          permissions: feature.permissions,
          userSettings: {},
        });
      }

      return NextResponse.json({
        success: true,
        data: configs,
        meta: {
          userId,
          totalDeployed: configs.length,
          targetApp: sanitizedTargetApp || "all",
        },
      });
    }
  } catch (error) {
    console.error("GET /api/overlay/config error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch overlay config" } },
      { status: 500 }
    );
  }
}
