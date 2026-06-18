ALTER TYPE "SubscriptionRequestStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

ALTER TABLE "SubscriptionRequest"
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "rejectionReason" TEXT;

ALTER TABLE "Subscription"
ADD COLUMN "sourceRequestId" TEXT;

CREATE UNIQUE INDEX "Subscription_sourceRequestId_key" ON "Subscription"("sourceRequestId");
