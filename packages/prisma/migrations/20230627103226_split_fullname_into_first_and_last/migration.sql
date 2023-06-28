/*
  Warnings:

  - You are about to drop the column `name` on the `Coach` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Coach` table without a default value. This is not possible if the table is not empty.

*/
-- Delete name column
-- Set not null constraints
-- AlterTable

ALTER TABLE "Coach"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;

UPDATE "Coach"
SET "firstName" = split_part("name", ' ', 1),
    "lastName" = split_part("name", ' ', 2);

-- AlterTable
ALTER TABLE "users"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;

UPDATE "users"
SET "firstName" = split_part("name", ' ', 1),
    "lastName" = split_part("name", ' ', 2);

ALTER TABLE "Coach"
DROP COLUMN "name",
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;
