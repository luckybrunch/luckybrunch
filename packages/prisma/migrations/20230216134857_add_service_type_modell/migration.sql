/*
  Warnings:

  - Added the required column `serviceTypeId` to the `EventType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventType" ADD COLUMN     "serviceTypeId" INTEGER;

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
