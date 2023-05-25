-- CreateTable
CREATE TABLE "ClientNotes" (
    "id" SERIAL NOT NULL,
    "coachUserId" INTEGER NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "ClientNotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientNotes_coachUserId_clientEmail_key" ON "ClientNotes"("coachUserId", "clientEmail");

-- AddForeignKey
ALTER TABLE "ClientNotes" ADD CONSTRAINT "ClientNotes_coachUserId_fkey" FOREIGN KEY ("coachUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
