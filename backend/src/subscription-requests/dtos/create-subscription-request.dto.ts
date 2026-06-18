import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateSubscriptionRequestDto {
  @IsString()
  @IsNotEmpty()
  householdMemberId: string;

  @IsString()
  @IsNotEmpty()
  offerId: string;

  @IsString()
  @IsOptional()
  payerMemberId?: string;

  @IsBoolean()
  intelligentDossierEnabled: boolean;

  @IsBoolean()
  autoRenewalEnabled: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  renewalMonths?: number;
}
