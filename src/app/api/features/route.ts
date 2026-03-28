import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, validateId } from "@/lib/security/sanitize";

const USE_CONVEX = !!process.env.NEXT_PUBLIC_CONVEX_URL;

async function getConvex() {
  const { convex } = await import("@/lib/convex");
  const { api } = await import("../../../../convex/_generated/api");
  return { convex, api };
}

/** Maximum allowed request body size (in bytes). */
const MAX_BODY_SIZE = 100_000;

/**
 * GET /api/features
 * List features with optional filters.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") as "trending" | "new" | "top" | null;
    const category = searchParams.get("category");
    const targetApp = searchParams.get("targetApp");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20", 10), 100);

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();
      const result = await convex.query(api.features.list, {
        filter: filter || undefined,
        category: category || undefined,
        targetApp: targetApp ? sanitizeInput(targetApp, 200) : undefined,
        search: search ? sanitizeInput(search, 200) : undefined,
        page: Number.isFinite(page) && page > 0 ? page : 1,
        pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
      });
      return NextResponse.json(result);
    } else {
      const { listFeatures } = await import("@/lib/data/features");
      const result = await listFeatures({
        filter: filter || undefined,
        category: (category as any) || undefined,
        targetApp: targetApp ? sanitizeInput(targetApp, 200) : undefined,
        search: search ? sanitizeInput(search, 200) : undefined,
        page: Number.isFinite(page) && page > 0 ? page : 1,
        pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
      });
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("GET /api/features error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to list features" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/features
 * Create a new feature.
 */
export async function POST(request: NextRequest) {
  try {
    // --- Request size guard --------------------------------------------------
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: "PAYLOAD_TOO_LARGE", message: "Request body exceeds size limit" } },
        { status: 413 }
      );
    }

    const body = await request.json();

    // --- Validation ----------------------------------------------------------
    const errors: string[] = [];
    if (!body.name || typeof body.name !== "string") {
      errors.push("name is required and must be a string");
    }
    if (!body.targetApp || typeof body.targetApp !== "string") {
      errors.push("targetApp is required and must be a string");
    }

    const authorId = body.authorId || request.headers.get("x-user-id") || "anonymous";
    const authorName = body.authorName || request.headers.get("x-user-name") || "Anonymous";

    if (authorId !== "anonymous" && !validateId(authorId)) {
      errors.push("authorId must be a valid ID format");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request", details: errors } },
        { status: 400 }
      );
    }

    // --- Sanitise inputs -----------------------------------------------------
    const name = sanitizeInput(body.name, 200);
    const description = sanitizeInput(body.description || "", 5000);
    const targetApp = sanitizeInput(body.targetApp, 200);
    const sanitizedAuthorName = sanitizeInput(authorName, 100);
    const tags: string[] = Array.isArray(body.tags)
      ? body.tags.slice(0, 20).map((t: unknown) => sanitizeInput(t, 50))
      : [];

    const validStatuses = ["draft", "published", "archived"] as const;
    const status = validStatuses.includes(body.status) ? body.status : "draft";

    const featureId = `feat_${Date.now().toString(36)}`;

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();
      const feature = await convex.mutation(api.features.create, {
        featureId,
        name,
        description,
        targetApp,
        category: body.category || "content-enhancer",
        authorId,
        authorName: sanitizedAuthorName,
        code: body.code || { html: "", css: "", js: "" },
        triggerConditions: body.triggerConditions || [],
        integrationHooks: body.integrationHooks || [],
        permissions: Array.isArray(body.permissions) ? body.permissions.slice(0, 20).map((p: unknown) => sanitizeInput(p, 100)) : [],
        tags,
        forkedFromId: body.forkedFromId && validateId(body.forkedFromId) ? body.forkedFromId : null,
        status,
      });

      // Associate feature with the author's profile
      await convex.mutation(api.users.addFeature, {
        userId: authorId,
        featureId,
      });

      return NextResponse.json({ success: true, data: feature }, { status: 201 });
    } else {
      const { createFeature } = await import("@/lib/data/features");
      const { addFeatureToUser } = await import("@/lib/data/users");

      const feature = await createFeature({
        name,
        description,
        targetApp,
        category: body.category || "content-enhancer",
        authorId,
        authorName: sanitizedAuthorName,
        code: body.code || { html: "", css: "", js: "" },
        triggerConditions: body.triggerConditions || [],
        integrationHooks: body.integrationHooks || [],
        permissions: Array.isArray(body.permissions) ? body.permissions.slice(0, 20).map((p: unknown) => sanitizeInput(p, 100)) : [],
        tags,
        forkedFromId: body.forkedFromId && validateId(body.forkedFromId) ? body.forkedFromId : null,
        status,
      });

      await addFeatureToUser(authorId, feature.id);

      return NextResponse.json({ success: true, data: feature }, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/features error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create feature" } },
      { status: 500 }
    );
  }
}
