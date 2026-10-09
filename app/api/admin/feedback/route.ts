// app/api/admin/feedback/route.ts
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { UserRole, FeedbackStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

export async function GET(req: Request) {
  try {
    await requireRole(UserRole.ADMIN);

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("search");

    const where: any = {};

    if (statusFilter && statusFilter !== "ALL") {
      if (Object.values(FeedbackStatus).includes(statusFilter as FeedbackStatus)) {
        where.status = statusFilter as FeedbackStatus;
      }
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim();
      where.OR = [
        { category: { contains: q, mode: "insensitive" } },
        { customTitle: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        {
          student: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { department: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          },
        },
      ];
    }

    const [
      feedbacks,
      totalCount,
      pendingCount,
      inProgressCount,
      implementedCount,
      resolvedCount,
      rejectedCount,
    ] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              department: true,
              currentSemester: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.feedback.count(),
      prisma.feedback.count({ where: { status: FeedbackStatus.PENDING } }),
      prisma.feedback.count({ where: { status: FeedbackStatus.IN_PROGRESS } }),
      prisma.feedback.count({ where: { status: FeedbackStatus.IMPLEMENTED } }),
      prisma.feedback.count({ where: { status: FeedbackStatus.RESOLVED } }),
      prisma.feedback.count({ where: { status: FeedbackStatus.REJECTED } }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          feedbacks,
          counts: {
            all: totalCount,
            pending: pendingCount,
            inProgress: inProgressCount,
            implemented: implementedCount,
            resolved: resolvedCount,
            rejected: rejectedCount,
          },
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  } catch (error: any) {
    logger.error("Admin feedback fetch error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Unauthorized" },
      { status: error?.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
