// app/api/admin/feedback/[id]/route.ts
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { UserRole, FeedbackStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/db";
import logger from "@/lib/logger";
import { notifyFeedbackUpdate } from "@/lib/push-service";
import { z } from "zod";

const updateFeedbackSchema = z.object({
  status: z.nativeEnum(FeedbackStatus),
  adminResponse: z.string().max(2500).optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(UserRole.ADMIN);

    const { id } = await params;
    const body = await req.json();

    const parsed = updateFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid update data",
        },
        { status: 400 }
      );
    }

    const { status, adminResponse } = parsed.data;

    const existing = await prisma.feedback.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, userId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Feedback not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: {
        status,
        adminResponse: adminResponse?.trim() || null,
        respondedAt: new Date(),
      },
    });

    // Notify student via Web Push in background
    try {
      await notifyFeedbackUpdate(
        existing.studentId,
        status,
        adminResponse?.trim() || null
      );
    } catch (pushErr) {
      logger.error("Failed to deliver push notification for feedback update:", pushErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Feedback updated and student notified successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error("Admin feedback update error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
