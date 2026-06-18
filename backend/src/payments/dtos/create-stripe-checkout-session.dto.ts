import { IsString, IsUUID } from "class-validator";

export class CreateStripeCheckoutSessionDto {
  @IsString()
  @IsUUID()
  subscriptionRequestId: string;
}
