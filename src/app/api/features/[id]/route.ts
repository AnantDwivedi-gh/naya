import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, validateId } from "@/lib/security/sanitize";

const USE_CONVEX = !!process.env.NEXT_PUBLIC_CONVEX_URL;

async function getConvex() {
  const { convex } = await import("@/lib/convex");
  const { api } = await import("../../../../../convex/_generated/api");
  return { convex, api };
}

/** Maximum allowed request body size (in bytes). */
const MAX_BODY_SIZE = 100_000;

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/features/:id
 * Retrieve a single feature by ID.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!validateId(id)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid feature ID format" } },
        { status: 400 }
      );
    }

    let feature;
    if (USE_CONVEX) {
      const { convex, api } = await getConvex();
      feature = await convex.query(api.features.get, { featureId: id });
    } else {
      const { getFeature } = await import("@/lib/data/features");
      feature = await getFeature(id);
    }

    if (!feature) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Feature not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: feature });
  } catch (error) {
    console.error("GET /api/features/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch feature" } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/features/:id
 * Update a feature. Only the provided fields are modified.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const body = await request.json();

    // Build update args
    const updateArgs: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updateArgs.name = sanitizeInput(body.name, 200);
    }
    if (body.description !== undefined) {
      updateArgs.description = sanitizeInput(body.description, 5000);
    }
    if (body.code !== undefined) {
      updateArgs.code = body.code;
    }
    if (body.triggerConditions !== undefined) {
      updateArgs.triggerConditions = body.triggerConditions;
    }
    if (body.integrationHooks !== undefined) {
      updateArgs.integrationHooks = body.integrationHooks;
    }
    if (body.permissions !== undefined) {
      updateArgs.permissions = Array.isArray(body.permissions)
        ? body.permissions.slice(0, 20).map((p: unknown) => sanitizeInput(p, 100))
        : [];
    }
    if (body.tags !== undefined) {
      updateArgs.tags = Array.isArray(body.tags)
        ? body.tags.slice(0, 20).map((t: unknown) => sanitizeInput(t, 50))
        : [];
    }
    if (body.status !== undefined) {
      const validStatuses = ["draft", "published", "archived"];
      if (validStatuses.includes(body.status)) {
        updateArgs.status = body.status;
      }
    }
    if (body.category !== undefined) {
      updateArgs.category = body.category;
    }

    if (Object.keys(updateArgs).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "No valid fields to update" } },
        { status: 400 }
      );
    }

    let feature;
    if (USE_CONVEX) {
      const { convex, api } = await getConvex();
      feature = await convex.mutation(api.features.update, { featureId: id, ...updateArgs } as any);
    } else {
      const { updateFeature } = await import("@/lib/data/features");
      feature = await updateFeature(id, updateArgs as any);
    }

    if (!feature) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Feature not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: feature });
  } catch (error) {
    console.error("PATCH /api/features/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update feature" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/features/:id
 * Delete a feature by ID.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!validateId(id)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid feature ID format" } },
        { status: 400 }
      );
    }

    let deleted;
    if (USE_CONVEX) {
      const { convex, api } = await getConvex();
      deleted = await convex.mutation(api.features.remove, { featureId: id });
    } else {
      const { deleteFeature } = await import("@/lib/data/features");
      deleted = await deleteFeature(id);
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Feature not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id, deleted: true } });
  } catch (error) {
    console.error("DELETE /api/features/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete feature" } },
      { status: 500 }
    );
  }
}
