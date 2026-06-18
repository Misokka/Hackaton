import { IsString, MinLength } from "class-validator";

export class RejectAdminSubscriptionRequestDto {
  @IsString()
  @MinLength(3)
  reason: string;
}
