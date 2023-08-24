-- CreateTable
CREATE TABLE "BillingDetails" (
    "userId" INTEGER NOT NULL,
    "name" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "zip" TEXT,
    "city" TEXT,
    "country" TEXT,
    "accountHolder" TEXT,
    "iban" TEXT,
    "bic" TEXT,

    CONSTRAINT "BillingDetails_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "BillingDetails" ADD CONSTRAINT "BillingDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
