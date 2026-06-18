import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  Prisma,
  NavigoPassStatus,
  NavigoPassSupportType,
  HouseholdMember,
  Subscription,
  SupportCase,
  SupportCaseResolution,
  SupportCaseStatus,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { buildNavigoNumber, formatNavigoNumber } from "src/navigo-passes/navigo-number.util";
import { CreateFoundPassDto } from "./dtos/create-found-pass.dto";
import { CreateLostPassDto } from "./dtos/create-lost-pass.dto";

type SupportCaseWithRelations = SupportCase & {
  member:
    | (HouseholdMember & { subscriptions?: Subscription[] })
    | null;
};

const CANCELLABLE_STATUSES: SupportCaseStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "TRANSFER_TO_PHONE_REQUESTED",
  "PASS_DEACTIVATION_REQUESTED",
];

const CLOSED_LOST_PASS_STATUSES: SupportCaseStatus[] = [
  "RESOLVED",
  "CANCELLED_BY_USER",
  "DIGITAL_SUPPORT_CONFIRMED",
  "PERMANENT_DIGITAL_TRANSFER_REQUESTED",
  "PHYSICAL_PASS_REACTIVATION_REQUESTED",
  "PHYSICAL_PASS_REACTIVATED",
];

@Injectable()
export class SupportCasesService {
  constructor(private readonly prismaService: PrismaService) {}

  // Numero de dossier affichable, ex : SOS-2026-0041
  private buildDossierNumber(supportCase: { id: string; createdAt: Date }) {
    const year = supportCase.createdAt.getFullYear();
    const segment = supportCase.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
    return `SOS-${year}-${segment}`;
  }

  private resolutionToStatus(resolution: SupportCaseResolution): SupportCaseStatus {
    if (resolution === "TRANSFER_TO_PHONE" || resolution === "TEMPORARY_DIGITAL_TRANSFER") {
      return "TRANSFER_TO_PHONE_REQUESTED";
    }

    if (resolution === "PERMANENT_DIGITAL_TRANSFER") {
      return "PERMANENT_DIGITAL_TRANSFER_REQUESTED";
    }

    return "PASS_DEACTIVATION_REQUESTED";
  }

  private statusLabel(status: SupportCaseStatus) {
    switch (status) {
      case "OPEN":
        return "Declaration recue";
      case "IN_PROGRESS":
        return "En cours de traitement";
      case "TRANSFER_TO_PHONE_REQUESTED":
        return "Transfert numerique temporaire demande";
      case "PASS_DEACTIVATION_REQUESTED":
        return "Nouvelle carte demandee";
      case "PERMANENT_DIGITAL_TRANSFER_REQUESTED":
        return "Passage definitif en numerique";
      case "PASS_FOUND_WAITING_PICKUP":
        return "Pass retrouve";
      case "PASS_PICKED_UP":
        return "Pass recupere";
      case "DIGITAL_SUPPORT_CONFIRMED":
        return "Support digital confirme";
      case "PHYSICAL_PASS_REACTIVATION_REQUESTED":
        return "Reactivation du pass demandee";
      case "PHYSICAL_PASS_REACTIVATED":
        return "Pass physique reactive";
      case "RESOLVED":
        return "Demande traitee";
      case "CANCELLED_BY_USER":
        return "Annulee";
      default:
        return status;
    }
  }

  private nextStepLabel(status: SupportCaseStatus) {
    switch (status) {
      case "OPEN":
        return "Verification de votre demande par nos equipes.";
      case "IN_PROGRESS":
        return "Un agent traite votre demande.";
      case "TRANSFER_TO_PHONE_REQUESTED":
        return "Votre titre est disponible en numerique en attendant un eventuel retour du pass.";
      case "PASS_DEACTIVATION_REQUESTED":
        return "Une nouvelle carte est demandee pour remplacer le pass perdu.";
      case "PERMANENT_DIGITAL_TRANSFER_REQUESTED":
        return "Votre titre reste desormais sur support numerique.";
      case "PASS_FOUND_WAITING_PICKUP":
        return "Votre pass est disponible au guichet indique.";
      case "PASS_PICKED_UP":
        return "Indiquez comment vous souhaitez continuer a utiliser votre titre.";
      case "DIGITAL_SUPPORT_CONFIRMED":
        return "Votre titre reste sur support digital.";
      case "PHYSICAL_PASS_REACTIVATION_REQUESTED":
        return "La reactivation du pass physique est enregistree.";
      case "PHYSICAL_PASS_REACTIVATED":
        return "Votre titre est de nouveau actif sur le pass physique.";
      case "RESOLVED":
        return "Votre demande a ete traitee.";
      case "CANCELLED_BY_USER":
        return "Vous avez annule cette declaration.";
      default:
        return "";
    }
  }

  private titleLabelForMember(member: SupportCaseWithRelations["member"]) {
    if (!member) {
      return null;
    }

    const latestSubscription = member.subscriptions?.[0];
    return latestSubscription?.productName ?? null;
  }

  private async syncNavigoPassState(
    tx: Prisma.TransactionClient,
    input: {
      memberId: string;
      navigoNumber: string;
      productName: string;
      status: NavigoPassStatus;
      supportType: NavigoPassSupportType;
    },
  ) {
    await tx.navigoPass.upsert({
      where: { householdMemberId: input.memberId },
      update: {
        navigoNumber: input.navigoNumber,
        productName: input.productName,
        status: input.status,
        supportType: input.supportType,
      },
      create: {
        householdMemberId: input.memberId,
        navigoNumber: input.navigoNumber,
        productName: input.productName,
        status: input.status,
        supportType: input.supportType,
      },
    });
  }

  private serializeSupportCase(supportCase: SupportCaseWithRelations) {
    return {
      id: supportCase.id,
      dossierNumber: this.buildDossierNumber(supportCase),
      type: supportCase.type,
      status: supportCase.status,
      statusLabel: this.statusLabel(supportCase.status),
      nextStep: this.nextStepLabel(supportCase.status),
      reason: supportCase.reason,
      chosenResolution: supportCase.chosenResolution,
      memberId: supportCase.memberId,
      memberName: supportCase.member
        ? `${supportCase.member.firstName} ${supportCase.member.lastName}`.trim()
        : null,
      titleLabel: this.titleLabelForMember(supportCase.member),
      passNumberMasked: supportCase.passNumberMasked,
      foundLocation: supportCase.foundLocation,
      foundDeskName: supportCase.foundDeskName,
      foundDeskAddress: supportCase.foundDeskAddress,
      foundAt: supportCase.foundAt?.toISOString() ?? null,
      clientNotifiedAt: supportCase.clientNotifiedAt?.toISOString() ?? null,
      pickedUpAt: supportCase.pickedUpAt?.toISOString() ?? null,
      finalChoice: supportCase.finalChoice,
      finalChoiceAt: supportCase.finalChoiceAt?.toISOString() ?? null,
      pickupDeadlineAt: supportCase.pickupDeadlineAt?.toISOString() ?? null,
      passDestroyedAt: supportCase.passDestroyedAt?.toISOString() ?? null,
      physicalPassReactivatedAt: supportCase.physicalPassReactivatedAt?.toISOString() ?? null,
      digitalSupportRating: supportCase.digitalSupportRating,
      cancellable: CANCELLABLE_STATUSES.includes(supportCase.status),
      createdAt: supportCase.createdAt.toISOString(),
      updatedAt: supportCase.updatedAt.toISOString(),
      cancelledAt: supportCase.cancelledAt?.toISOString() ?? null,
      resolvedAt: supportCase.resolvedAt?.toISOString() ?? null,
    };
  }

  private async getHouseholdForUser(userId: string) {
    const household = await this.prismaService.household.findFirst({
      where: { ownerId: userId },
      include: { members: true },
    });

    if (!household) {
      throw new NotFoundException("Aucun espace famille trouve pour cet utilisateur.");
    }

    return household;
  }

  async createLostPassCase(userId: string, data: CreateLostPassDto) {
    if (data.understandsDeactivation !== true) {
      throw new BadRequestException(
        "Vous devez confirmer avoir compris que le pass physique sera desactive.",
      );
    }

    const household = await this.getHouseholdForUser(userId);
    const member = household.members.find((candidate) => candidate.id === data.memberId);

    if (!member) {
      throw new NotFoundException("Le profil selectionne est introuvable.");
    }

    // On ne peut declarer une perte que si un titre est rattache au profil.
    const latestSubscription = await this.prismaService.subscription.findFirst({
      where: { householdMemberId: member.id },
      orderBy: { updatedAt: "desc" },
    });

    if (!latestSubscription) {
      throw new BadRequestException(
        "Aucun pass actif n'est rattache a ce profil : la perte ne peut pas etre declaree.",
      );
    }

    // Une seule declaration de perte active a la fois par profil.
    const existingActiveCase = await this.prismaService.supportCase.findFirst({
      where: {
        memberId: member.id,
        type: "LOST_PASS",
        status: { notIn: CLOSED_LOST_PASS_STATUSES },
      },
    });

    if (existingActiveCase) {
      throw new ConflictException(
        "Une declaration de perte est deja en cours pour ce profil.",
      );
    }

    const isTemporaryTransfer = ["TRANSFER_TO_PHONE", "TEMPORARY_DIGITAL_TRANSFER"].includes(data.chosenResolution);
    const isPermanentDigital = data.chosenResolution === "PERMANENT_DIGITAL_TRANSFER";
    const wantsReplacementCard = ["DEACTIVATE_ONLY", "REPLACEMENT_CARD"].includes(data.chosenResolution);
    const status = this.resolutionToStatus(data.chosenResolution);
    const passNumberMasked = buildNavigoNumber(member.id);
    const now = new Date();

    const createdCase = await this.prismaService.$transaction(async (tx) => {
      const supportCase = await tx.supportCase.create({
        data: {
          householdId: household.id,
          memberId: member.id,
          type: "LOST_PASS",
          status,
          reason: data.reason,
          chosenResolution: data.chosenResolution,
          passNumberMasked,
          description: `Declaration de perte (${data.reason}).`,
          finalChoice: isPermanentDigital ? "DIGITAL_SUPPORT" : null,
          finalChoiceAt: isPermanentDigital ? now : null,
          resolvedAt: isPermanentDigital ? now : null,
        },
      });

      await tx.subscription.update({
        where: { id: latestSubscription.id },
        data: isTemporaryTransfer || isPermanentDigital
          ? {
              // Le titre reste valable, desormais disponible sur smartphone.
              status: "ACTIVE",
              nextActionLabel: isPermanentDigital
                ? "Titre conserve sur support numerique"
                : "Titre disponible sur smartphone temporairement",
            }
          : {
              status: "LOST",
              nextActionLabel: "Suivre la demande de nouvelle carte",
            },
      });

      await this.syncNavigoPassState(tx, {
        memberId: member.id,
        navigoNumber: passNumberMasked,
        productName: latestSubscription.productName,
        status: "ACTIVE",
        supportType: isTemporaryTransfer || isPermanentDigital ? "DIGITAL" : "PHYSICAL",
      });

      await tx.familyNotification.create({
        data: {
          householdId: household.id,
          memberId: member.id,
          type: "SUPPORT_UPDATE",
          severity: isTemporaryTransfer || isPermanentDigital ? "SUCCESS" : "WARNING",
          title: isTemporaryTransfer
            ? `${member.firstName} — Titre transfere temporairement en numerique`
            : isPermanentDigital
              ? `${member.firstName} — Passage definitif en numerique`
              : `${member.firstName} — Nouvelle carte demandee`,
          message: isTemporaryTransfer
            ? "Le transfert numerique temporaire est actif. Une alerte sera affichee si le pass est retrouve."
            : isPermanentDigital
              ? "Le titre reste sur support numerique. Aucun nouveau pass physique n'est demande."
              : "Le pass perdu est desactive. Une nouvelle carte est demandee pour remplacer le support perdu.",
        },
      });

      await tx.householdActivity.create({
        data: {
          householdId: household.id,
          memberId: member.id,
          label: isTemporaryTransfer
            ? `${member.firstName} a demande un transfert numerique temporaire apres perte du pass.`
            : isPermanentDigital
              ? `${member.firstName} est passe definitivement au support numerique apres perte du pass.`
              : `${member.firstName} a demande une nouvelle carte apres perte du pass.`,
        },
      });

      return supportCase;
    });

    return {
      message: isTemporaryTransfer
        ? "Le support numerique temporaire est active. Votre pass physique est considere comme perdu."
        : isPermanentDigital
          ? "Votre titre est maintenant conserve sur support numerique. Le dossier est cloture."
          : wantsReplacementCard
            ? "Votre pass est desactive et une demande de nouvelle carte a ete enregistree."
            : "Votre declaration de perte a ete enregistree.",
      supportCase: {
        id: createdCase.id,
        type: createdCase.type,
        status: createdCase.status,
        dossierNumber: this.buildDossierNumber(createdCase),
      },
    };
  }

  async getMyCases(userId: string) {
    const household = await this.getHouseholdForUser(userId);

    const supportCases = await this.prismaService.supportCase.findMany({
      where: { householdId: household.id },
      orderBy: { createdAt: "desc" },
      include: {
        member: {
          include: {
            subscriptions: { orderBy: { updatedAt: "desc" }, take: 1 },
          },
        },
      },
    });

    return {
      supportCases: supportCases.map((supportCase) => this.serializeSupportCase(supportCase)),
    };
  }

  async getCaseById(userId: string, supportCaseId: string) {
    const household = await this.getHouseholdForUser(userId);

    const supportCase = await this.prismaService.supportCase.findFirst({
      where: { id: supportCaseId, householdId: household.id },
      include: {
        member: {
          include: {
            subscriptions: { orderBy: { updatedAt: "desc" }, take: 1 },
          },
        },
      },
    });

    if (!supportCase) {
      throw new NotFoundException("Cette declaration est introuvable.");
    }

    return this.serializeSupportCase(supportCase);
  }

  async getRecoveredAlerts(userId: string) {
    const household = await this.getHouseholdForUser(userId);
    const supportCases = await this.prismaService.supportCase.findMany({
      where: {
        householdId: household.id,
        type: "LOST_PASS",
        status: { in: ["PASS_FOUND_WAITING_PICKUP", "PASS_PICKED_UP"] },
      },
      include: {
        member: {
          include: {
            subscriptions: { orderBy: { updatedAt: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return supportCases.map((supportCase) => this.serializeSupportCase(supportCase));
  }

  async markPickedUp(_userId: string, _supportCaseId: string) {
    throw new ForbiddenException("Action reservee a un agent.");
  }

  async registerFinalChoice(
    userId: string,
    supportCaseId: string,
    finalChoice: "DIGITAL_SUPPORT" | "PHYSICAL_PASS_REACTIVATION",
    digitalSupportRating: number,
  ) {
    const household = await this.getHouseholdForUser(userId);
    const supportCase = await this.prismaService.supportCase.findFirst({
      where: {
        id: supportCaseId,
        householdId: household.id,
        type: "LOST_PASS",
        status: { in: ["PASS_PICKED_UP", "PASS_FOUND_WAITING_PICKUP"] },
      },
    });

    if (!supportCase) {
      throw new NotFoundException("Ce dossier ne peut pas recevoir de choix final.");
    }

    if (supportCase.status === "PASS_FOUND_WAITING_PICKUP" && finalChoice !== "DIGITAL_SUPPORT") {
      throw new BadRequestException("La reactivation du pass physique est possible seulement apres recuperation au guichet.");
    }

    const status = finalChoice === "DIGITAL_SUPPORT"
      ? "DIGITAL_SUPPORT_CONFIRMED"
      : "PHYSICAL_PASS_REACTIVATED";

    const updated = await this.prismaService.$transaction(async (tx) => {
      const chosen = await tx.supportCase.update({
        where: { id: supportCase.id },
        data: {
          status,
          finalChoice,
          finalChoiceAt: new Date(),
          digitalSupportRating,
          physicalPassReactivatedAt: finalChoice === "PHYSICAL_PASS_REACTIVATION" ? new Date() : null,
          resolvedAt: new Date(),
        },
      });

      if (supportCase.memberId) {
        const subscription = await tx.subscription.findFirst({
          where: { householdMemberId: supportCase.memberId },
          orderBy: { updatedAt: "desc" },
        });

        if (subscription) {
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "ACTIVE",
              nextActionLabel: finalChoice === "DIGITAL_SUPPORT"
                ? "Titre conserve sur smartphone"
                : null,
            },
          });

          await this.syncNavigoPassState(tx, {
            memberId: supportCase.memberId,
            navigoNumber: supportCase.passNumberMasked ?? buildNavigoNumber(supportCase.memberId),
            productName: subscription.productName,
            status: "ACTIVE",
            supportType: finalChoice === "DIGITAL_SUPPORT" ? "DIGITAL" : "PHYSICAL",
          });
        }
      }

      await tx.familyNotification.create({
        data: {
          householdId: household.id,
          memberId: supportCase.memberId,
          type: "SUPPORT_UPDATE",
          severity: "SUCCESS",
          title: "Choix SOS Navigo enregistre",
          message: finalChoice === "DIGITAL_SUPPORT"
            ? "Votre titre reste sur support digital."
            : "Votre titre est de nouveau actif sur le pass physique.",
        },
      });

      await tx.householdActivity.create({
        data: {
          householdId: household.id,
          memberId: supportCase.memberId,
          label: finalChoice === "DIGITAL_SUPPORT"
            ? "Choix final SOS Navigo : support digital conserve."
            : "Choix final SOS Navigo : pass physique reactive.",
        },
      });

      return chosen;
    });

    const refreshed = await this.prismaService.supportCase.findFirstOrThrow({
      where: { id: updated.id },
      include: {
        member: {
          include: {
            subscriptions: { orderBy: { updatedAt: "desc" }, take: 1 },
          },
        },
      },
    });

    return this.serializeSupportCase(refreshed);
  }

  async cancelCase(userId: string, supportCaseId: string) {
    const household = await this.getHouseholdForUser(userId);

    const supportCase = await this.prismaService.supportCase.findFirst({
      where: { id: supportCaseId, householdId: household.id },
    });

    if (!supportCase) {
      throw new NotFoundException("Cette declaration est introuvable.");
    }

    if (!CANCELLABLE_STATUSES.includes(supportCase.status)) {
      throw new ConflictException(
        "Cette declaration ne peut plus etre annulee car elle a deja ete traitee ou annulee.",
      );
    }

    const updatedCase = await this.prismaService.$transaction(async (tx) => {
      const cancelled = await tx.supportCase.update({
        where: { id: supportCase.id },
        data: {
          status: "CANCELLED_BY_USER",
          cancelledAt: new Date(),
        },
      });

      if (supportCase.memberId) {
        const latestSubscription = await tx.subscription.findFirst({
          where: { householdMemberId: supportCase.memberId },
          orderBy: { updatedAt: "desc" },
        });

        if (latestSubscription) {
          await tx.subscription.update({
            where: { id: latestSubscription.id },
            data: {
              status: "ACTIVE",
              nextActionLabel: null,
            },
          });

          await this.syncNavigoPassState(tx, {
            memberId: supportCase.memberId,
            navigoNumber: supportCase.passNumberMasked ?? buildNavigoNumber(supportCase.memberId),
            productName: latestSubscription.productName,
            status: "ACTIVE",
            supportType: "PHYSICAL",
          });
        }

        await tx.familyNotification.create({
          data: {
            householdId: household.id,
            memberId: supportCase.memberId,
            type: "SUPPORT_UPDATE",
            severity: "SUCCESS",
            title: "Declaration de perte annulee",
            message:
              "La declaration a ete annulee. Votre pass reste utilisable si aucune desactivation n'a ete effectuee.",
          },
        });

        await tx.householdActivity.create({
          data: {
            householdId: household.id,
            memberId: supportCase.memberId,
            label: "Une declaration de perte a ete annulee (passe retrouve).",
          },
        });
      }

      return cancelled;
    });

    return {
      message:
        "La declaration a ete annulee. Votre pass reste utilisable si aucune desactivation n'a ete effectuee.",
      supportCase: {
        id: updatedCase.id,
        status: updatedCase.status,
      },
    };
  }

  async createFoundPassCase(data: CreateFoundPassDto) {
    const passNumberMasked = formatNavigoNumber(data.passNumber);
    const supportCase = await this.prismaService.supportCase.create({
      data: {
        type: "FOUND_PASS",
        status: "OPEN",
        passNumberMasked,
        foundLocation: data.foundLocation,
        depositedAtDesk: data.depositedAtDesk,
      },
    });

    return {
      message: "Signalement enregistre. Merci pour votre aide.",
      supportCaseId: supportCase.id,
      passNumberMasked,
    };
  }
}
