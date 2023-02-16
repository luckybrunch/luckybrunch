-- CreateTable
CREATE TABLE "Specialization" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SpecializationToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SpecializationToUser_AB_unique" ON "_SpecializationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_SpecializationToUser_B_index" ON "_SpecializationToUser"("B");

-- AddForeignKey
ALTER TABLE "_SpecializationToUser" ADD CONSTRAINT "_SpecializationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Specialization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpecializationToUser" ADD CONSTRAINT "_SpecializationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
