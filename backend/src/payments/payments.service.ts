import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import Stripe from "stripe";
import { CancelStripeSessionDto } from "./dtos/cancel-stripe-session.dto";
import { ConfirmStripeSessionDto } from "./dtos/confirm-stripe-session.dto";
import { CreateStripeCheckoutSessionDto } from "./dtos/create-stripe-checkout-session.dto";

@Injectable()
export class PaymentsService {
  private readonly stripeSecret: string | null;
  private readonly appUrl: string;

  constructor(
    private readonly prismaService: PrismaService,
    configService: ConfigService,
  ) {
    this.stripeSecret = configService.get<string>("STRIPE_SECRET") ?? null;
    this.appUrl = (configService.get<string>("APP_URL") ?? "http://localhost:3000").replace(/\/+$/, "");
  }

  private getStripe(): Stripe.Stripe {
    if (!this.stripeSecret) {
      throw new BadRequestException("La clé STRIPE_SECRET n'est pas configurée sur le backend.");
    }

    return new Stripe(this.stripeSecret);
  }

  private async findRequestForUser(userId: string, id: string) {
    const request = await this.prismaService.subscriptionRequest.findFirst({
      where: {
        id,
        household: { ownerId: userId },
      },
      include: {
        household: true,
        member: true,
        offer: true,
      },
    });

    if (!request) {
      throw new NotFoundException("Demande de souscription introuvable.");
    }

    return request;
  }

  private assertPayable(request: {
    status: string;
    totalAmountCents: number | null;
    currency: string;
    paymentConfirmedAt?: Date | null;
  }) {
    if (request.paymentConfirmedAt || ["PAYMENT_CONFIRMED", "UNDER_REVIEW", "CONFIRMED", "ACTIVE"].includes(request.status)) {
      throw new BadRequestException("Cette demande est déjà payée ou en traitement.");
    }

    if (!request.totalAmountCents || request.totalAmountCents <= 0) {
      throw new BadRequestException("Le montant de cette demande est indisponible.");
    }

    if ((request.currency ?? "EUR").toUpperCase() !== "EUR") {
      throw new BadRequestException("Seuls les paiements en euros sont acceptés.");
    }
  }

  async createCheckoutSession(userId: string, data: CreateStripeCheckoutSessionDto) {
    const request = await this.findRequestForUser(userId, data.subscriptionRequestId);
    this.assertPayable(request);
    const stripe = this.getStripe();
    const totalAmountCents = request.totalAmountCents ?? 0;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${this.appUrl}/dashboard/family/subscriptions/${request.id}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.appUrl}/dashboard/family/subscriptions/${request.id}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: totalAmountCents,
            product_data: {
              name: request.offer.name,
              description: `Demande ${request.requestNumber ?? request.id}`,
            },
          },
        },
      ],
      metadata: {
        subscriptionRequestId: request.id,
        userId,
        householdId: request.householdId,
        memberId: request.memberId,
      },
      payment_intent_data: {
        metadata: {
          subscriptionRequestId: request.id,
          userId,
          householdId: request.householdId,
          memberId: request.memberId,
        },
      },
    });

    await this.prismaService.subscriptionRequest.update({
      where: { id: request.id },
      data: {
        status: "PAYMENT_PENDING",
        stripeCheckoutSessionId: session.id,
        paymentCancelledAt: null,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async confirmSession(userId: string, data: ConfirmStripeSessionDto) {
    const stripe = this.getStripe();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const subscriptionRequestId = session.metadata?.subscriptionRequestId;

    if (!subscriptionRequestId) {
      throw new BadRequestException("Session Stripe invalide.");
    }

    const existing = await this.findRequestForUser(userId, subscriptionRequestId);

    if (existing.stripeCheckoutSessionId && existing.stripeCheckoutSessionId !== session.id) {
      throw new BadRequestException("Cette session Stripe ne correspond pas à la demande.");
    }

    if (session.payment_status !== "paid") {
      throw new BadRequestException("Le paiement Stripe n'est pas confirmé.");
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const updated = await this.prismaService.$transaction(async (tx) => {
      await tx.subscriptionDocument.updateMany({
        where: {
          subscriptionRequestId,
          status: "UPLOADED",
        },
        data: {
          status: "UNDER_REVIEW",
        },
      });

      const request = await tx.subscriptionRequest.update({
        where: { id: subscriptionRequestId },
        data: {
          status: "UNDER_REVIEW",
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          paymentConfirmedAt: new Date(),
          paymentSimulatedAt: new Date(),
          paymentCancelledAt: null,
          submittedAt: new Date(),
        },
        include: {
          household: { include: { owner: true } },
          member: true,
          payerMember: true,
          offer: true,
          documents: { orderBy: { createdAt: "asc" } },
          addresses: true,
        },
      });

      await tx.familyNotification.create({
        data: {
          householdId: existing.householdId,
          memberId: existing.memberId,
          type: "RENEWAL",
          severity: "SUCCESS",
          title: `${existing.member.firstName} — paiement confirmé`,
          message: `Le paiement ${existing.offer.name} est confirmé. Le dossier va être vérifié par nos équipes.`,
        },
      });

      await tx.householdActivity.create({
        data: {
          householdId: existing.householdId,
          memberId: existing.memberId,
          label: `Paiement Stripe confirmé pour la demande ${existing.offer.name}.`,
        },
      });

      return request;
    });

    return {
      id: updated.id,
      status: updated.status,
      paymentConfirmedAt: updated.paymentConfirmedAt?.toISOString() ?? null,
      stripeCheckoutSessionId: updated.stripeCheckoutSessionId,
    };
  }

  async cancelSession(userId: string, data: CancelStripeSessionDto) {
    const stripe = this.getStripe();
    const subscriptionRequestId = data.subscriptionRequestId
      ?? (data.sessionId
        ? (await stripe.checkout.sessions.retrieve(data.sessionId)).metadata?.subscriptionRequestId
        : null);

    if (!subscriptionRequestId) {
      throw new BadRequestException("Demande de souscription manquante.");
    }

    const request = await this.findRequestForUser(userId, subscriptionRequestId);

    if (request.paymentConfirmedAt || ["UNDER_REVIEW", "CONFIRMED", "ACTIVE"].includes(request.status)) {
      return {
        id: request.id,
        status: request.status,
      };
    }

    const updated = await this.prismaService.subscriptionRequest.update({
      where: { id: request.id },
      data: {
        status: "PAYMENT_CANCELLED",
        paymentCancelledAt: new Date(),
      },
    });

    return {
      id: updated.id,
      status: updated.status,
    };
  }
}
