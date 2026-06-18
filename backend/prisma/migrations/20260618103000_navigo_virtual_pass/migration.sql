CREATE TYPE "NavigoPassSupportType" AS ENUM ('PHYSICAL', 'DIGITAL');

CREATE TYPE "NavigoPassStatus" AS ENUM ('ACTIVE', 'IN_PROGRESS', 'DISABLED');

CREATE TABLE "NavigoPass" (
  "id" TEXT NOT NULL,
  "householdMemberId" TEXT NOT NULL,
  "navigoNumber" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "supportType" "NavigoPassSupportType" NOT NULL DEFAULT 'PHYSICAL',
  "status" "NavigoPassStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NavigoPass_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NavigoPassSupportSwitch" (
  "id" TEXT NOT NULL,
  "navigoPassId" TEXT NOT NULL,
  "previousSupport" "NavigoPassSupportType" NOT NULL,
  "newSupport" "NavigoPassSupportType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NavigoPassSupportSwitch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NavigoPass_householdMemberId_key" ON "NavigoPass"("householdMemberId");
CREATE UNIQUE INDEX "NavigoPass_navigoNumber_key" ON "NavigoPass"("navigoNumber");
CREATE INDEX "NavigoPass_householdMemberId_idx" ON "NavigoPass"("householdMemberId");
CREATE INDEX "NavigoPass_supportType_idx" ON "NavigoPass"("supportType");
CREATE INDEX "NavigoPass_status_idx" ON "NavigoPass"("status");
CREATE INDEX "NavigoPassSupportSwitch_navigoPassId_idx" ON "NavigoPassSupportSwitch"("navigoPassId");
CREATE INDEX "NavigoPassSupportSwitch_createdAt_idx" ON "NavigoPassSupportSwitch"("createdAt");

ALTER TABLE "NavigoPass" ADD CONSTRAINT "NavigoPass_householdMemberId_fkey" FOREIGN KEY ("householdMemberId") REFERENCES "HouseholdMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NavigoPassSupportSwitch" ADD CONSTRAINT "NavigoPassSupportSwitch_navigoPassId_fkey" FOREIGN KEY ("navigoPassId") REFERENCES "NavigoPass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
