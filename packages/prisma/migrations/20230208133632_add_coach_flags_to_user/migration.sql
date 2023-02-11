-- AlterTable
ALTER TABLE "users" ADD COLUMN     "completedProfileCertificates" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completedProfileInformations" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completedProfileServices" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requestedReviewAt" TIMESTAMP(3),
ADD COLUMN     "reviewedAt" TIMESTAMP(3);
