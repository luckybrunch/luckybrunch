-- DropForeignKey
ALTER TABLE "EventType" DROP CONSTRAINT "EventType_serviceTypeId_fkey";

-- AlterTable
ALTER TABLE "EventType" ALTER COLUMN "serviceTypeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
