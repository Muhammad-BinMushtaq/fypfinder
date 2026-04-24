-- CreateTable
CREATE TABLE "PastFypIdea" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "groupNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "supervisor" TEXT NOT NULL,
    "students" JSONB NOT NULL,
    "keywords" JSONB NOT NULL,
    "searchText" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PastFypIdea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PastFypIdea_sourceKey_key" ON "PastFypIdea"("sourceKey");

-- CreateIndex
CREATE INDEX "PastFypIdea_batch_idx" ON "PastFypIdea"("batch");

-- CreateIndex
CREATE INDEX "PastFypIdea_groupNumber_idx" ON "PastFypIdea"("groupNumber");

