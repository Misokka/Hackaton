import { IsString, IsUUID } from "class-validator";

export class CreateStripePaymentIntentDto {
  @IsString()
  @IsUUID()
  subscriptionRequestId: string;
}
