import { IsString, MinLength } from "class-validator";

export class ConfirmStripePaymentIntentDto {
  @IsString()
  @MinLength(5)
  paymentIntentId: string;
}
