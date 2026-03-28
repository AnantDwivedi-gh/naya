import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, validateId } from "@/lib/security/sanitize";

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
 * GET /api/community/:id/polls
 * List all polls for a community.
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

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();

      // Verify community exists
      const community = await convex.query(api.communities.get, { communityId: id });
      if (!community) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Community not found" } },
          { status: 404 }
        );
      }

      const polls = await convex.query(api.polls.listByCommunity, { communityId: id });
      return NextResponse.json({ success: true, data: polls });
    } else {
      const { getCommunity } = await import("@/lib/data/communities");
      const { listPollsByCommunity } = await import("@/lib/data/polls");

      // Verify community exists
      const community = await getCommunity(id);
      if (!community) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Community not found" } },
          { status: 404 }
        );
      }

      const polls = await listPollsByCommunity(id);
      return NextResponse.json({ success: true, data: polls });
    }
  } catch (error) {
    console.error("GET /api/community/[id]/polls error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to list polls" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/:id/polls
 * Create a new poll in a community.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // --- Request size guard --------------------------------------------------
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: "PAYLOAD_TOO_LARGE", message: "Request body exceeds size limit" } },
        { status: 413 }
      );
    }

    if (!validateId(id)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid community ID format" } },
        { status: 400 }
      );
    }

    const body = await request.json();

    // --- Validate ------------------------------------------------------------
    const errors: string[] = [];
    if (!body.title || typeof body.title !== "string") {
      errors.push("title is required and must be a string");
    }
    if (!body.options || !Array.isArray(body.options) || body.options.length < 2) {
      errors.push("options must be an array with at least 2 items");
    }
    if (body.options && body.options.length > 10) {
      errors.push("maximum 10 options allowed");
    }
    if (!body.endsAt) {
      errors.push("endsAt is required (ISO 8601 date string)");
    } else if (isNaN(Date.parse(String(body.endsAt)))) {
      errors.push("endsAt must be a valid ISO 8601 date string");
    }

    const authorId = body.authorId || request.headers.get("x-user-id");
    if (!authorId) {
      errors.push("authorId is required");
    } else if (!validateId(authorId)) {
      errors.push("authorId must be a valid ID format");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request", details: errors } },
        { status: 400 }
      );
    }

    // --- Sanitise inputs -----------------------------------------------------
    const title = sanitizeInput(body.title, 300);
    const description = sanitizeInput(body.description || "", 2000);
    const optionLabels: string[] = body.options
      .slice(0, 10)
      .map((o: unknown) =>
        sanitizeInput(
          typeof o === "string"
            ? o
            : typeof o === "object" && o !== null && "label" in o
              ? String((o as { label: unknown }).label)
              : "",
          200
        )
      );

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();

      // Verify community exists
      const community = await convex.query(api.communities.get, { communityId: id });
      if (!community) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Community not found" } },
          { status: 404 }
        );
      }

      const pollId = `poll_${Date.now().toString(36)}`;

      const poll = await convex.mutation(api.polls.create, {
        pollId,
        communityId: id,
        authorId: authorId as string,
        title,
        description,
        optionLabels,
        status: "active",
        endsAt: body.endsAt,
      });

      await convex.mutation(api.communities.addPoll, {
        communityId: id,
        pollId,
      });

      return NextResponse.json({ success: true, data: poll }, { status: 201 });
    } else {
      const { getCommunity, addPollToCommunity } = await import("@/lib/data/communities");
      const { createPoll } = await import("@/lib/data/polls");

      // Verify community exists
      const community = await getCommunity(id);
      if (!community) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Community not found" } },
          { status: 404 }
        );
      }

      const poll = await createPoll({
        communityId: id,
        authorId: authorId as string,
        title,
        description,
        options: optionLabels,
        status: "active",
        endsAt: body.endsAt,
      });

      await addPollToCommunity(id, poll.id);

      return NextResponse.json({ success: true, data: poll }, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/community/[id]/polls error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create poll" } },
      { status: 500 }
    );
  }
}
