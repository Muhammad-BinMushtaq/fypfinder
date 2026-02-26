/*
  Warnings:

  - You are about to drop the `Industry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentIndustry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StudentIndustry" DROP CONSTRAINT "StudentIndustry_industryId_fkey";

-- DropForeignKey
ALTER TABLE "StudentIndustry" DROP CONSTRAINT "StudentIndustry_studentId_fkey";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "industryPreference" TEXT;

-- DropTable
DROP TABLE "Industry";

-- DropTable
DROP TABLE "StudentIndustry";
