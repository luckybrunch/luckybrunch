/*
  Warnings:

  - You are about to drop the column `description` on the `Certificate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_typeId_fkey";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "description",
ALTER COLUMN "typeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CertificateType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
