import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CancelStripeSessionDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  subscriptionRequestId?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  sessionId?: string;
}
