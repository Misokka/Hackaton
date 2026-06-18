CREATE TYPE "SubscriptionRenewalType" AS ENUM ('ANNUAL', 'MONTHLY');

CREATE TYPE "SubscriptionRenewalStatus" AS ENUM ('ACTIVE', 'DISABLED', 'CANCELLED', 'EXPIRED');

ALTER TABLE "SubscriptionRequest"
  ADD COLUMN "renewalType" "SubscriptionRenewalType",
  ADD COLUMN "renewalStatus" "SubscriptionRenewalStatus" NOT NULL DEFAULT 'DISABLED',
  ADD COLUMN "renewalMonths" INTEGER,
  ADD COLUMN "renewalMonthsRemaining" INTEGER,
  ADD COLUMN "renewalNextDate" TIMESTAMP(3),
  ADD COLUMN "renewalActivatedAt" TIMESTAMP(3),
  ADD COLUMN "renewalCancelledAt" TIMESTAMP(3);

CREATE INDEX "SubscriptionRequest_renewalStatus_idx" ON "SubscriptionRequest"("renewalStatus");
