-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ValidationRecommendation" AS ENUM ('STRONGLY_RECOMMENDED', 'RECOMMENDED_WITH_CHANGES', 'NEEDS_MAJOR_REVISION', 'NOT_RECOMMENDED');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "isEdited" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "FYPIdeaValidation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "ideaDescription" TEXT NOT NULL,
    "coreFeatures" TEXT NOT NULL,
    "teamSize" INTEGER,
    "inputHash" TEXT NOT NULL,
    "panelEvaluation" JSONB,
    "finalResult" JSONB,
    "detailedRoadmap" JSONB,
    "feasibilityScore" INTEGER,
    "innovationScore" INTEGER,
    "industryRelevanceScore" INTEGER,
    "originalityScore" INTEGER,
    "usefulnessScore" INTEGER,
    "recommendation" "ValidationRecommendation",
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "modelUsed" TEXT,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FYPIdeaValidation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FYPIdeaValidation_studentId_inputHash_key" ON "FYPIdeaValidation"("studentId", "inputHash");

-- CreateIndex
CREATE INDEX "FYPIdeaValidation_studentId_idx" ON "FYPIdeaValidation"("studentId");

-- CreateIndex
CREATE INDEX "FYPIdeaValidation_inputHash_idx" ON "FYPIdeaValidation"("inputHash");

-- CreateIndex
CREATE INDEX "FYPIdeaValidation_createdAt_idx" ON "FYPIdeaValidation"("createdAt");

-- CreateIndex
CREATE INDEX "FYPIdeaValidation_recommendation_idx" ON "FYPIdeaValidation"("recommendation");

-- AddForeignKey
ALTER TABLE "FYPIdeaValidation" ADD CONSTRAINT "FYPIdeaValidation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
