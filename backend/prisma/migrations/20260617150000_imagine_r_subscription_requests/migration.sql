-- CreateEnum
CREATE TYPE "SubscriptionRequestFlow" AS ENUM ('GENERIC', 'IMAGINE_R');

-- CreateEnum
CREATE TYPE "SubscriptionRequestAddressType" AS ENUM ('HOLDER', 'PAYER');

-- CreateEnum
CREATE TYPE "ImagineRScholarshipStatus" AS ENUM ('YES', 'NO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ImagineRDeliveryMode" AS ENUM ('PAYER_HOME');

-- AlterTable
ALTER TABLE "SubscriptionRequest"
ADD COLUMN "requestNumber" TEXT,
ADD COLUMN "flowType" "SubscriptionRequestFlow" NOT NULL DEFAULT 'GENERIC',
ADD COLUMN "hasPreviousImagineR" BOOLEAN,
ADD COLUMN "hasCustomerNumber" BOOLEAN,
ADD COLUMN "customerNumber" TEXT,
ADD COLUMN "infoCertificationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "holderAddressSameAsPayer" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "payerBirthDate" TIMESTAMP(3),
ADD COLUMN "schoolZipOrCity" TEXT,
ADD COLUMN "schoolName" TEXT,
ADD COLUMN "imagineRSchoolLevel" "SchoolLevel",
ADD COLUMN "scholarshipStatus" "ImagineRScholarshipStatus",
ADD COLUMN "forfaitStartDate" TIMESTAMP(3),
ADD COLUMN "validityStartDate" TIMESTAMP(3),
ADD COLUMN "validityEndDate" TIMESTAMP(3),
ADD COLUMN "deliveryMode" "ImagineRDeliveryMode",
ADD COLUMN "baseAmountCents" INTEGER,
ADD COLUMN "feeAmountCents" INTEGER,
ADD COLUMN "totalAmountCents" INTEGER,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN "signatureInformationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "signaturePayerAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "signatureTermsAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "signatureDocumentsAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "signedAt" TIMESTAMP(3),
ADD COLUMN "paymentSimulatedAt" TIMESTAMP(3),
ADD COLUMN "submittedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SubscriptionDocument"
ADD COLUMN "simulatedFileName" TEXT,
ADD COLUMN "simulatedMimeType" TEXT,
ADD COLUMN "simulatedSizeBytes" INTEGER,
ADD COLUMN "uploadedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SubscriptionRequestAddress" (
    "id" TEXT NOT NULL,
    "subscriptionRequestId" TEXT NOT NULL,
    "type" "SubscriptionRequestAddressType" NOT NULL,
    "street" TEXT NOT NULL,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "addressLine3" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'France',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionRequestAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionRequest_requestNumber_key" ON "SubscriptionRequest"("requestNumber");

-- CreateIndex
CREATE INDEX "SubscriptionRequest_flowType_idx" ON "SubscriptionRequest"("flowType");

-- CreateIndex
CREATE INDEX "SubscriptionRequest_status_idx" ON "SubscriptionRequest"("status");

-- CreateIndex
CREATE INDEX "SubscriptionRequestAddress_subscriptionRequestId_idx" ON "SubscriptionRequestAddress"("subscriptionRequestId");

-- CreateIndex
CREATE INDEX "SubscriptionRequestAddress_type_idx" ON "SubscriptionRequestAddress"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionRequestAddress_subscriptionRequestId_type_key" ON "SubscriptionRequestAddress"("subscriptionRequestId", "type");

-- AddForeignKey
ALTER TABLE "SubscriptionRequestAddress" ADD CONSTRAINT "SubscriptionRequestAddress_subscriptionRequestId_fkey" FOREIGN KEY ("subscriptionRequestId") REFERENCES "SubscriptionRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
