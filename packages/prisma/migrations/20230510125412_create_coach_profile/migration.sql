-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('STARTED', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_userId_fkey";

-- DropForeignKey
ALTER TABLE "_SpecializationToUser" DROP CONSTRAINT "_SpecializationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_SpecializationToUser" DROP CONSTRAINT "_SpecializationToUser_B_fkey";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "userId",
ADD COLUMN     "coachId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "appointmentTypes",
DROP COLUMN "city",
DROP COLUMN "companyName",
DROP COLUMN "country",
DROP COLUMN "zip",
ADD COLUMN     "coachProfileDraftId" INTEGER,
ADD COLUMN     "coachProfileId" INTEGER;

-- DropTable
DROP TABLE "_SpecializationToUser";

-- CreateTable
CREATE TABLE "Coach" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "companyName" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "zip" TEXT,
    "city" TEXT,
    "country" TEXT,
    "appointmentTypes" TEXT,
    "requestedReviewAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewStatus" "ReviewStatus",

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoachToSpecialization" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CoachToSpecialization_AB_unique" ON "_CoachToSpecialization"("A", "B");

-- CreateIndex
CREATE INDEX "_CoachToSpecialization_B_index" ON "_CoachToSpecialization"("B");

-- CreateIndex
CREATE UNIQUE INDEX "users_coachProfileId_key" ON "users"("coachProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "users_coachProfileDraftId_key" ON "users"("coachProfileDraftId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_coachProfileDraftId_fkey" FOREIGN KEY ("coachProfileDraftId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachToSpecialization" ADD CONSTRAINT "_CoachToSpecialization_A_fkey" FOREIGN KEY ("A") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachToSpecialization" ADD CONSTRAINT "_CoachToSpecialization_B_fkey" FOREIGN KEY ("B") REFERENCES "Specialization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
