import { NextRequest, NextResponse } from "next/server";
import { generateFeature, generateFeatureFromTemplate } from "@/lib/ai/generator";
import { GenerateFeatureRequest, FeatureCategory } from "@/lib/data/types";
import { sanitizeInput, sanitizePrompt } from "@/lib/security/sanitize";

/** Maximum allowed request body size (in bytes). */
const MAX_BODY_SIZE = 50_000;

/**
 * POST /api/features/generate
 *
 * CORE ENDPOINT: AI feature generation.
 * Takes a natural language description, target app, and desired behavior,
 * then returns generated overlay feature code and configuration.
 *
 * If the OpenAI API key is not set, falls back to template-based generation.
 *
 * NOTE: This endpoint does not use Convex — it only generates code via AI/templates.
 * The caller should POST to /api/features to persist the result.
 */
export async function POST(request: NextRequest) {
  try {
    // --- Request size guard --------------------------------------------------
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, data: null, meta: null, error: { code: "PAYLOAD_TOO_LARGE", message: "Request body exceeds size limit" } },
        { status: 413 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: null,
          error: { code: "INVALID_JSON", message: "Request body must be valid JSON" },
        },
        { status: 400 }
      );
    }

    // --- Input validation ---------------------------------------------------
    const errors: string[] = [];

    if (!body.description || typeof body.description !== "string" || !(body.description as string).trim()) {
      errors.push("description is required and must be a non-empty string");
    }
    if (!body.targetApp || typeof body.targetApp !== "string") {
      errors.push("targetApp is required and must be a string");
    }
    if (!body.desiredBehavior || typeof body.desiredBehavior !== "string") {
      errors.push("desiredBehavior is required and must be a string");
    }

    const validCategories: FeatureCategory[] = [
      "fact-checker", "workflow-automator", "content-enhancer",
      "data-extractor", "ui-modifier", "accessibility",
      "productivity", "entertainment",
    ];
    if (body.category && !validCategories.includes(body.category as FeatureCategory)) {
      errors.push(`category must be one of: ${validCategories.join(", ")}`);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: null,
          error: { code: "VALIDATION_ERROR", message: errors.join("; "), details: errors },
        },
        { status: 400 }
      );
    }

    // --- Sanitise inputs (prompt-injection aware) ----------------------------
    const descriptionResult = sanitizePrompt(body.description as string, 5000);
    const desiredBehaviorResult = sanitizePrompt(body.desiredBehavior as string, 5000);
    const targetApp = sanitizeInput(body.targetApp as string, 200);

    // Log if prompt injection was detected (do not block — just flag)
    if (descriptionResult.injectionDetected || desiredBehaviorResult.injectionDetected) {
      console.warn(
        "Potential prompt injection detected in /api/features/generate",
        {
          descriptionFlagged: descriptionResult.injectionDetected,
          behaviorFlagged: desiredBehaviorResult.injectionDetected,
        }
      );
    }

    // --- Build request ------------------------------------------------------
    const genRequest: GenerateFeatureRequest = {
      description: descriptionResult.text,
      targetApp,
      desiredBehavior: desiredBehaviorResult.text,
      category: (body.category as FeatureCategory) || undefined,
    };

    // --- Generate -----------------------------------------------------------
    let generated;
    let generationMethod: "ai" | "template";

    if (process.env.OPENAI_API_KEY) {
      try {
        generated = await generateFeature(genRequest);
        generationMethod = "ai";
      } catch (aiError) {
        console.warn(
          "AI generation failed, falling back to template:",
          aiError instanceof Error ? aiError.message : "Unknown error"
        );
        generated = generateFeatureFromTemplate(genRequest);
        generationMethod = "template";
      }
    } else {
      generated = generateFeatureFromTemplate(genRequest);
      generationMethod = "template";
    }

    return NextResponse.json({
      success: true,
      data: generated,
      meta: {
        generationMethod,
        promptInjectionDetected:
          descriptionResult.injectionDetected || desiredBehaviorResult.injectionDetected,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/features/generate error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        meta: null,
        error: {
          code: "GENERATION_ERROR",
          message: error instanceof Error ? error.message : "Feature generation failed",
        },
      },
      { status: 500 }
    );
  }
}
