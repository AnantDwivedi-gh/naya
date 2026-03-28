import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, validateId } from "@/lib/security/sanitize";

const USE_CONVEX = !!process.env.NEXT_PUBLIC_CONVEX_URL;

async function getConvex() {
  const { convex } = await import("@/lib/convex");
  const { api } = await import("../../../../convex/_generated/api");
  return { convex, api };
}

/** Maximum allowed request body size (in bytes). */
const MAX_BODY_SIZE = 10_000;

/**
 * GET /api/community
 * List communities with optional search and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20", 10), 100);

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();
      const result = await convex.query(api.communities.list, {
        search: search ? sanitizeInput(search, 200) : undefined,
        page: Number.isFinite(page) && page > 0 ? page : 1,
        pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
      });
      return NextResponse.json(result);
    } else {
      const { listCommunities } = await import("@/lib/data/communities");
      const result = await listCommunities({
        search: search ? sanitizeInput(search, 200) : undefined,
        page: Number.isFinite(page) && page > 0 ? page : 1,
        pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
      });
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("GET /api/community error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to list communities" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community
 * Create a new community.
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
    if (!body.description || typeof body.description !== "string") {
      errors.push("description is required and must be a string");
    }

    const ownerId = body.ownerId || request.headers.get("x-user-id");
    if (!ownerId) {
      errors.push("ownerId is required");
    } else if (!validateId(ownerId)) {
      errors.push("ownerId must be a valid ID (alphanumeric, hyphens, underscores, max 128 chars)");
    }

    if (body.tags && !Array.isArray(body.tags)) {
      errors.push("tags must be an array of strings");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request", details: errors } },
        { status: 400 }
      );
    }

    // --- Sanitise inputs -----------------------------------------------------
    const name = sanitizeInput(body.name, 200);
    const description = sanitizeInput(body.description, 2000);
    const iconUrl = sanitizeInput(body.iconUrl || "/icons/default.svg", 500);
    const tags: string[] = Array.isArray(body.tags)
      ? body.tags.slice(0, 20).map((t: unknown) => sanitizeInput(t, 50))
      : [];

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();
      const communityId = `comm_${Date.now().toString(36)}`;

      const community = await convex.mutation(api.communities.create, {
        communityId,
        name,
        description,
        iconUrl,
        ownerId: ownerId as string,
        tags,
      });

      return NextResponse.json({ success: true, data: community }, { status: 201 });
    } else {
      const { createCommunity } = await import("@/lib/data/communities");

      const community = await createCommunity({
        name,
        description,
        iconUrl,
        ownerId: ownerId as string,
        tags,
      });

      return NextResponse.json({ success: true, data: community }, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/community error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create community" } },
      { status: 500 }
    );
  }
}
