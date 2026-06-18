import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import type { AuthenticatedRequest } from "src/auth/guards/jwt-auth.guard";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CancelStripeSessionDto } from "./dtos/cancel-stripe-session.dto";
import { ConfirmStripePaymentIntentDto } from "./dtos/confirm-stripe-payment-intent.dto";
import { ConfirmStripeSessionDto } from "./dtos/confirm-stripe-session.dto";
import { CreateStripeCheckoutSessionDto } from "./dtos/create-stripe-checkout-session.dto";
import { CreateStripePaymentIntentDto } from "./dtos/create-stripe-payment-intent.dto";
import { PaymentsService } from "./payments.service";

@Controller("api/payments/stripe")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("checkout-session")
  async createCheckoutSession(
    @Req() request: AuthenticatedRequest,
    @Body() data: CreateStripeCheckoutSessionDto,
  ) {
    return this.paymentsService.createCheckoutSession(request.user.sub, data);
  }

  @Post("payment-intent")
  async createPaymentIntent(
    @Req() request: AuthenticatedRequest,
    @Body() data: CreateStripePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(request.user.sub, data);
  }

  @Post("confirm-session")
  async confirmSession(
    @Req() request: AuthenticatedRequest,
    @Body() data: ConfirmStripeSessionDto,
  ) {
    return this.paymentsService.confirmSession(request.user.sub, data);
  }

  @Post("confirm-payment-intent")
  async confirmPaymentIntent(
    @Req() request: AuthenticatedRequest,
    @Body() data: ConfirmStripePaymentIntentDto,
  ) {
    return this.paymentsService.confirmPaymentIntent(request.user.sub, data);
  }

  @Post("cancel-session")
  async cancelSession(
    @Req() request: AuthenticatedRequest,
    @Body() data: CancelStripeSessionDto,
  ) {
    return this.paymentsService.cancelSession(request.user.sub, data);
  }
}
