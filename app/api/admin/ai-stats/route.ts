// app/api/admin/ai-stats/route.ts
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import { UserRole } from "@/lib/generated/prisma/enums"
import prisma from "@/lib/db"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN)

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOf30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Parallel queries for fast aggregation
    const [
      totalAllTime,
      totalToday,
      totalLast30Days,
      successfulRequests,
      fallbackRequests,
      rateLimitedRequests,
      recentLogs,
      providerBreakdown,
      modelBreakdown,
      tokenSum,
    ] = await Promise.all([
      prisma.aIRequestLog.count(),
      prisma.aIRequestLog.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.aIRequestLog.count({ where: { createdAt: { gte: startOf30Days } } }),
      prisma.aIRequestLog.count({ where: { status: "SUCCESS" } }),
      prisma.aIRequestLog.count({ where: { isFallback: true, status: "SUCCESS" } }),
      prisma.aIRequestLog.count({ where: { status: "RATE_LIMITED" } }),
      prisma.aIRequestLog.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
      }),
      prisma.aIRequestLog.groupBy({
        by: ["provider"],
        _count: { _all: true },
        where: { createdAt: { gte: startOf30Days } },
      }),
      prisma.aIRequestLog.groupBy({
        by: ["modelId"],
        _count: { _all: true },
        where: { createdAt: { gte: startOf30Days } },
      }),
      prisma.aIRequestLog.aggregate({
        _sum: {
          totalTokens: true,
          promptTokens: true,
          completionTokens: true,
        },
      }),
    ])

    const successRate = totalAllTime > 0
      ? Number(((successfulRequests / totalAllTime) * 100).toFixed(1))
      : 100

    const fallbackRate = totalAllTime > 0
      ? Number(((fallbackRequests / totalAllTime) * 100).toFixed(1))
      : 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAllTime,
          totalToday,
          totalLast30Days,
          successRate,
          fallbackRate,
          rateLimitedRequests,
          totalTokens: tokenSum._sum.totalTokens ?? 0,
          promptTokens: tokenSum._sum.promptTokens ?? 0,
          completionTokens: tokenSum._sum.completionTokens ?? 0,
          estimatedSavings: "$0.00 (All Free Tier)",
        },
        providerBreakdown: providerBreakdown.map((p) => ({
          provider: p.provider,
          count: p._count._all,
        })),
        modelBreakdown: modelBreakdown.map((m) => ({
          model: m.modelId,
          count: m._count._all,
        })),
        recentLogs,
      },
    })
  } catch (error) {
    logger.error("Admin AI stats error:", error)
    const isUnauthorized = error instanceof Error && error.message.includes("Unauthorized")
    return NextResponse.json(
      { success: false, message: isUnauthorized ? "Unauthorized" : "Failed to fetch AI telemetry" },
      { status: isUnauthorized ? 403 : 500 }
    )
  }
}
