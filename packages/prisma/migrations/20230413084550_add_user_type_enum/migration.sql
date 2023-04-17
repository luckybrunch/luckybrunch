-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('COACH', 'CUSTOMER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "customerType" "CustomerType" DEFAULT 'COACH';

UPDATE "users" SET "customerType" = 'COACH';

ALTER TABLE "users" ALTER COLUMN "customerType" SET NOT NULL;
