/*
  Warnings:

  - You are about to drop the column `customerType` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('COACH', 'CLIENT');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "customerType",
ADD COLUMN     "userType" "UserType" DEFAULT 'COACH';

UPDATE "users" SET "userType" = 'COACH';

ALTER TABLE "users" ALTER COLUMN "userType" SET NOT NULL;

-- DropEnum
DROP TYPE "CustomerType";
