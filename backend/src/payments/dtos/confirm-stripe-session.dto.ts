import { IsString, MinLength } from "class-validator";

export class ConfirmStripeSessionDto {
  @IsString()
  @MinLength(5)
  sessionId: string;
}
