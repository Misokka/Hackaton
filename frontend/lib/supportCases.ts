import type {
  SupportCaseFinalChoice,
  LostPassReason,
  SupportCaseResolution,
  SupportCaseStatus,
} from "@/lib/api/types";
import { buildNavigoNumber } from "./navigo";

type BadgeTone = "blue" | "green" | "orange" | "red";

export const supportCaseStatusLabels: Record<SupportCaseStatus, string> = {
  OPEN: "Declaration recue",
  IN_PROGRESS: "En cours de traitement",
  TRANSFER_TO_PHONE_REQUESTED: "Perte Navigo : transfert numerique temporaire demande",
  PASS_DEACTIVATION_REQUESTED: "Perte Navigo : nouvelle carte demandee",
  PERMANENT_DIGITAL_TRANSFER_REQUESTED: "Perte Navigo : passage definitif en numerique",
  PASS_FOUND_WAITING_PICKUP: "Perte Navigo : en attente de recuperation",
  PASS_PICKED_UP: "Perte Navigo : pass retrouve",
  DIGITAL_SUPPORT_CONFIRMED: "Perte Navigo : titre conserve en digital",
  PHYSICAL_PASS_REACTIVATION_REQUESTED: "Perte Navigo : reactivation du pass demandee",
  PHYSICAL_PASS_REACTIVATED: "Perte Navigo : pass retrouve",
  RESOLVED: "Perte Navigo : dossier cloture",
  CANCELLED_BY_USER: "Annulee",
};

export const supportCaseStatusTones: Record<SupportCaseStatus, BadgeTone> = {
  OPEN: "blue",
  IN_PROGRESS: "orange",
  TRANSFER_TO_PHONE_REQUESTED: "blue",
  PASS_DEACTIVATION_REQUESTED: "orange",
  PERMANENT_DIGITAL_TRANSFER_REQUESTED: "green",
  PASS_FOUND_WAITING_PICKUP: "green",
  PASS_PICKED_UP: "green",
  DIGITAL_SUPPORT_CONFIRMED: "green",
  PHYSICAL_PASS_REACTIVATION_REQUESTED: "blue",
  PHYSICAL_PASS_REACTIVATED: "green",
  RESOLVED: "green",
  CANCELLED_BY_USER: "red",
};

export const lostPassReasonLabels: Record<LostPassReason, string> = {
  LOST: "Passe perdu",
  STOLEN: "Passe vole",
  DAMAGED: "Passe endommage",
  UNKNOWN: "Raison non precisee",
};

export const resolutionLabels: Record<SupportCaseResolution, string> = {
  TRANSFER_TO_PHONE: "Transfert numerique temporaire",
  DEACTIVATE_ONLY: "Nouvelle carte demandee",
  TEMPORARY_DIGITAL_TRANSFER: "Transfert numerique temporaire",
  REPLACEMENT_CARD: "Nouvelle carte demandee",
  PERMANENT_DIGITAL_TRANSFER: "Passage definitif en numerique",
};

export const finalChoiceLabels: Record<SupportCaseFinalChoice, string> = {
  DIGITAL_SUPPORT: "Rester sur support digital",
  PHYSICAL_PASS_REACTIVATION: "Reactiver mon pass physique",
};

export function simulateMaskedPass(memberId: string) {
  return buildNavigoNumber(memberId);
}

export function formatSupportCaseDate(isoDate: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}
