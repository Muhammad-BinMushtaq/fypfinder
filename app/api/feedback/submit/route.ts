// app/api/feedback/submit/route.ts
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { UserRole, FeedbackStatus } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/db";
import logger from "@/lib/logger";
import { z } from "zod";

const feedbackSchema = z.object({
  category: z.string().min(2, "Category is required"),
  customTitle: z.string().max(100).optional().nullable(),
  description: z
    .string()
    .min(15, "Please provide at least 15 characters describing your feedback")
    .max(2500, "Description cannot exceed 2500 characters"),
});

export async function POST(req: Request) {
  try {
    const currentUser = await requireRole(UserRole.STUDENT);

    const student = await prisma.student.findUnique({
      where: { userId: currentUser.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student profile not found" },
        { status: 404 }
      );
    }

    // Strict rule: check if user already has an active ticket under review
    const existingActive = await prisma.feedback.findFirst({
      where: {
        studentId: student.id,
        status: { in: [FeedbackStatus.PENDING, FeedbackStatus.IN_PROGRESS] },
      },
    });

    if (existingActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You already have feedback currently under review. You can submit another once an administrator has reviewed it.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid feedback data",
        },
        { status: 400 }
      );
    }

    const { category, customTitle, description } = parsed.data;

    // If "Other" category was selected, customTitle is recommended
    const finalCustomTitle =
      category.toLowerCase().includes("other") && customTitle
        ? customTitle.trim()
        : customTitle || null;

    const newFeedback = await prisma.feedback.create({
      data: {
        studentId: student.id,
        category: category.trim(),
        customTitle: finalCustomTitle,
        description: description.trim(),
        status: FeedbackStatus.PENDING,
      },
    });

    logger.info(`Feedback submitted by student ${student.id}: ${category}`);

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your feedback has been received and sent to the team.",
        data: newFeedback,
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error("Error submitting feedback:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
