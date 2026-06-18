ALTER TYPE "SubscriptionRequestStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_CONFIRMED';
ALTER TYPE "SubscriptionRequestStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_CANCELLED';

ALTER TABLE "SubscriptionRequest"
ADD COLUMN "paymentConfirmedAt" TIMESTAMP(3),
ADD COLUMN "paymentCancelledAt" TIMESTAMP(3),
ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "stripePaymentIntentId" TEXT;

CREATE INDEX "SubscriptionRequest_stripeCheckoutSessionId_idx" ON "SubscriptionRequest"("stripeCheckoutSessionId");
