/*
  Warnings:

  - The values [STARTED,APPROVED,REJECTED] on the enum `ReviewStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `reviewStatus` on table `Coach` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReviewStatus_new" AS ENUM ('DRAFT', 'REVIEW_REQUESTED', 'REVIEW_STARTED', 'PUBLISHED');
ALTER TABLE "Coach" ALTER COLUMN "reviewStatus" TYPE "ReviewStatus_new" USING ("reviewStatus"::text::"ReviewStatus_new");

UPDATE "Coach" SET "reviewStatus" = 'DRAFT'::"ReviewStatus_new";

ALTER TYPE "ReviewStatus" RENAME TO "ReviewStatus_old";
ALTER TYPE "ReviewStatus_new" RENAME TO "ReviewStatus";
DROP TYPE "ReviewStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Coach" ADD COLUMN     "rejectionReason" TEXT,
ALTER COLUMN "reviewStatus" SET NOT NULL;
