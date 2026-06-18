import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

const SUBSCRIPTION_REQUEST_STATUSES = [
  "DRAFT",
  "WAITING_DOCUMENTS",
  "UNDER_REVIEW",
  "PAYMENT_PENDING",
  "CONFIRMED",
  "ACTIVE",
  "BLOCKED",
  "CANCELLED",
] as const;

export class UpdateSubscriptionRequestDto {
  @IsOptional()
  @IsBoolean()
  intelligentDossierEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  autoRenewalEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  renewalMonths?: number;

  @IsOptional()
  @IsIn(SUBSCRIPTION_REQUEST_STATUSES)
  status?: (typeof SUBSCRIPTION_REQUEST_STATUSES)[number];
}
