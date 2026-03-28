import { NextRequest, NextResponse } from "next/server";
import { validateId } from "@/lib/security/sanitize";

const USE_CONVEX = !!process.env.NEXT_PUBLIC_CONVEX_URL;

async function getConvex() {
  const { convex } = await import("@/lib/convex");
  const { api } = await import("../../../../../../../../convex/_generated/api");
  return { convex, api };
}

/** Maximum allowed request body size (in bytes). */
const MAX_BODY_SIZE = 2_000;

interface RouteContext {
  params: Promise<{ id: string; pollId: string }>;
}

/**
 * POST /api/community/:id/polls/:pollId/vote
 * Cast a vote on a poll option.
 *
 * Request body:
 *   optionId: string -- the option to vote for
 *   userId:   string -- the voter (or from x-user-id header)
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

    const { id, pollId } = await context.params;

    if (!validateId(id) || !validateId(pollId)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid ID format in URL" } },
        { status: 400 }
      );
    }

    const body = await request.json();

    const userId = body.userId || request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "userId is required" } },
        { status: 400 }
      );
    }
    if (!validateId(userId)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "userId must be a valid ID format" } },
        { status: 400 }
      );
    }

    if (!body.optionId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "optionId is required" } },
        { status: 400 }
      );
    }
    if (!validateId(body.optionId)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "optionId must be a valid ID format" } },
        { status: 400 }
      );
    }

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();

      const result = await convex.mutation(api.polls.vote, {
        pollId,
        optionId: body.optionId,
        userId,
      });

      if (!result.success) {
        const statusCode = result.error === "Poll not found" ? 404 : 400;
        return NextResponse.json(
          { success: false, error: { code: "VOTE_ERROR", message: result.error } },
          { status: statusCode }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          poll: result.poll,
          results: result.results,
        },
      });
    } else {
      const { vote, getPollResults } = await import("@/lib/data/polls");

      const result = await vote(pollId, body.optionId, userId);

      if (!result.success) {
        const statusCode = result.error === "Poll not found" ? 404 : 400;
        return NextResponse.json(
          { success: false, error: { code: "VOTE_ERROR", message: result.error } },
          { status: statusCode }
        );
      }

      const results = await getPollResults(pollId);

      return NextResponse.json({
        success: true,
        data: {
          poll: result.poll,
          results,
        },
      });
    }
  } catch (error) {
    console.error("POST /api/community/[id]/polls/[pollId]/vote error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to register vote" } },
      { status: 500 }
    );
  }
}
