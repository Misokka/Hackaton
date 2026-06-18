import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { NavigoPass, NavigoPassStatus, NavigoPassSupportType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

const MONTHLY_SWITCH_LIMIT = 3;

@Injectable()
export class NavigoPassesService {
  constructor(private readonly prismaService: PrismaService) {}

  private getCurrentMonthStart() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  private maskNavigoNumber(navigoNumber: string) {
    const lastFour = navigoNumber.slice(-4);
    return `NAV-****-${lastFour}`;
  }

  private buildNavigoNumber(memberId: string) {
    const compact = memberId.replace(/-/g, "").toUpperCase();
    return `NAV-${compact.slice(0, 4)}-${compact.slice(-4)}`;
  }

  private async assertMemberBelongsToUser(userId: string, memberId: string) {
    const member = await this.prismaService.householdMember.findFirst({
      where: {
        id: memberId,
        household: {
          ownerId: userId,
        },
      },
      include: {
        household: true,
        subscriptions: {
          orderBy: { updatedAt: "desc" },
        },
        subscriptionRequests: {
          orderBy: { updatedAt: "desc" },
          include: { offer: true },
        },
        navigoPass: {
          include: {
            supportSwitches: {
              orderBy: { createdAt: "desc" },
              take: 6,
            },
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException("Aucun profil foyer trouvé pour cet identifiant.");
    }

    return member;
  }

  async ensurePassForMember(userId: string, memberId: string) {
    const member = await this.assertMemberBelongsToUser(userId, memberId);
    return this.ensurePassFromMemberRecord(member);
  }

  async ensurePassFromMemberRecord(member: any) {
    if (member.navigoPass) {
      return this.formatPass(member.navigoPass, member.firstName, member.lastName);
    }

    const activeSubscription = member.subscriptions[0] ?? null;
    const activeRequest = member.subscriptionRequests.find(
      (request) => !["DRAFT", "CANCELLED", "BLOCKED"].includes(request.status),
    );

    if (!activeSubscription && !activeRequest) {
      return null;
    }

    const pass = await this.prismaService.navigoPass.create({
      data: {
        householdMemberId: member.id,
        navigoNumber: this.buildNavigoNumber(member.id),
        productName: activeSubscription?.productName ?? activeRequest?.offer.name ?? "Titre Navigo",
        status: activeSubscription ? "ACTIVE" : "IN_PROGRESS",
        supportType: "PHYSICAL",
      },
      include: {
        supportSwitches: {
          orderBy: { createdAt: "desc" },
          take: 6,
        },
      },
    });

    return this.formatPass(pass, member.firstName, member.lastName);
  }

  private async countSwitchesThisMonth(passId: string) {
    return this.prismaService.navigoPassSupportSwitch.count({
      where: {
        navigoPassId: passId,
        createdAt: {
          gte: this.getCurrentMonthStart(),
        },
      },
    });
  }

  private async formatPass(
    pass: NavigoPass & {
      supportSwitches?: Array<{
        id: string;
        previousSupport: NavigoPassSupportType;
        newSupport: NavigoPassSupportType;
        createdAt: Date;
      }>;
    },
    firstName: string,
    lastName: string,
  ) {
    const switchesUsed = await this.countSwitchesThisMonth(pass.id);

    return {
      id: pass.id,
      holderName: `${firstName} ${lastName}`.trim(),
      navigoNumberMasked: this.maskNavigoNumber(pass.navigoNumber),
      productName: pass.productName,
      supportType: pass.supportType,
      status: pass.status,
      monthlySwitchLimit: MONTHLY_SWITCH_LIMIT,
      switchesUsedThisMonth: switchesUsed,
      switchesRemainingThisMonth: Math.max(MONTHLY_SWITCH_LIMIT - switchesUsed, 0),
      history: (pass.supportSwitches ?? []).map((entry) => ({
        id: entry.id,
        previousSupport: entry.previousSupport,
        newSupport: entry.newSupport,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  }

  async switchSupportForUser(userId: string, memberId: string, targetSupport: NavigoPassSupportType) {
    const member = await this.assertMemberBelongsToUser(userId, memberId);
    const formattedPass = await this.ensurePassFromMemberRecord(member);

    if (!formattedPass) {
      throw new BadRequestException("Aucun pass Navigo disponible pour ce profil.");
    }

    const pass = await this.prismaService.navigoPass.findUnique({
      where: { id: formattedPass.id },
      include: {
        supportSwitches: {
          orderBy: { createdAt: "desc" },
          take: 6,
        },
      },
    });

    if (!pass) {
      throw new NotFoundException("Aucun pass Navigo trouvé.");
    }

    if (pass.supportType === targetSupport) {
      throw new BadRequestException("Ce support est déjà actif pour ce pass.");
    }

    if (pass.status === ("DISABLED" satisfies NavigoPassStatus)) {
      throw new ForbiddenException("Ce pass ne peut pas changer de support.");
    }

    const switchesUsed = await this.countSwitchesThisMonth(pass.id);

    if (switchesUsed >= MONTHLY_SWITCH_LIMIT) {
      throw new BadRequestException(
        "Vous avez atteint la limite de 3 changements de support ce mois-ci. Vous pourrez à nouveau changer de support le mois prochain.",
      );
    }

    const updated = await this.prismaService.$transaction(async (tx) => {
      await tx.navigoPassSupportSwitch.create({
        data: {
          navigoPassId: pass.id,
          previousSupport: pass.supportType,
          newSupport: targetSupport,
        },
      });

      return tx.navigoPass.update({
        where: { id: pass.id },
        data: { supportType: targetSupport },
        include: {
          supportSwitches: {
            orderBy: { createdAt: "desc" },
            take: 6,
          },
        },
      });
    });

    return this.formatPass(updated, member.firstName, member.lastName);
  }
}
