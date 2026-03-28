import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, validateId } from "@/lib/security/sanitize";

const USE_CONVEX = !!process.env.NEXT_PUBLIC_CONVEX_URL;

async function getConvex() {
  const { convex } = await import("@/lib/convex");
  const { api } = await import("../../../../../convex/_generated/api");
  return { convex, api };
}

/** Maximum allowed request body size (in bytes). */
const MAX_BODY_SIZE = 10_000;

/**
 * POST /api/device/capabilities
 * Detect and register device capabilities for the overlay runtime.
 * The client sends browser/OS/screen info; we store it and return
 * a device ID for future reference.
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

    if (!body.browser || typeof body.browser !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "browser is required and must be a string" } },
        { status: 400 }
      );
    }
    if (!body.os || typeof body.os !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "os is required and must be a string" } },
        { status: 400 }
      );
    }

    // --- Sanitise inputs -----------------------------------------------------
    const browser = sanitizeInput(body.browser, 100);
    const os = sanitizeInput(body.os, 100);
    const screenWidth = typeof body.screenWidth === "number" && Number.isFinite(body.screenWidth) ? Math.max(0, Math.floor(body.screenWidth)) : 0;
    const screenHeight = typeof body.screenHeight === "number" && Number.isFinite(body.screenHeight) ? Math.max(0, Math.floor(body.screenHeight)) : 0;
    const supportedApis: string[] = Array.isArray(body.supportedApis)
      ? body.supportedApis.slice(0, 50).map((a: unknown) => sanitizeInput(a, 100))
      : [];
    const extensionsInstalled: string[] = Array.isArray(body.extensionsInstalled)
      ? body.extensionsInstalled.slice(0, 50).map((e: unknown) => sanitizeInput(e, 100))
      : [];

    if (USE_CONVEX) {
      const { convex, api } = await getConvex();

      // Check if this user already has a registered device with same browser/os
      const existing = await convex.query(api.deviceCapabilities.getByUserBrowserOs, {
        userId,
        browser,
        os,
      });

      if (existing) {
        // Update existing registration
        const updated = await convex.mutation(api.deviceCapabilities.update, {
          deviceId: existing.deviceId,
          screenWidth: screenWidth || undefined,
          screenHeight: screenHeight || undefined,
          supportedApis: supportedApis.length > 0 ? supportedApis : undefined,
          extensionsInstalled: extensionsInstalled.length > 0 ? extensionsInstalled : undefined,
        });

        return NextResponse.json({
          success: true,
          data: updated,
          meta: { action: "updated" },
        });
      }

      // Create new device registration
      const deviceId = `device_${Date.now().toString(36)}`;
      const capabilities = await convex.mutation(api.deviceCapabilities.register, {
        deviceId,
        userId,
        browser,
        os,
        screenWidth,
        screenHeight,
        supportedApis,
        extensionsInstalled,
      });

      return NextResponse.json(
        { success: true, data: capabilities, meta: { action: "created" } },
        { status: 201 }
      );
    } else {
      const { getByUserBrowserOs, updateDevice, registerDevice } = await import("@/lib/data/deviceCapabilities");

      // Check if this user already has a registered device with same browser/os
      const existing = await getByUserBrowserOs(userId, browser, os);

      if (existing) {
        const updated = await updateDevice(existing.id, {
          screenWidth: screenWidth || undefined,
          screenHeight: screenHeight || undefined,
          supportedApis: supportedApis.length > 0 ? supportedApis : undefined,
          extensionsInstalled: extensionsInstalled.length > 0 ? extensionsInstalled : undefined,
        });

        return NextResponse.json({
          success: true,
          data: updated,
          meta: { action: "updated" },
        });
      }

      // Create new device registration
      const deviceId = `device_${Date.now().toString(36)}`;
      const capabilities = await registerDevice({
        deviceId,
        userId,
        browser,
        os,
        screenWidth,
        screenHeight,
        supportedApis,
        extensionsInstalled,
      });

      return NextResponse.json(
        { success: true, data: capabilities, meta: { action: "created" } },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("POST /api/device/capabilities error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to register device" } },
      { status: 500 }
    );
  }
}
