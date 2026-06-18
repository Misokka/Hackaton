import type { SubscriptionRequestStatus } from "./api/types";

const labels: Record<SubscriptionRequestStatus, string> = {
  DRAFT: "Brouillon",
  WAITING_DOCUMENTS: "Justificatifs attendus",
  PAYMENT_PENDING: "Paiement à confirmer",
  UNDER_REVIEW: "En vérification",
  CONFIRMED: "Confirmée",
  ACTIVE: "Active",
  BLOCKED: "Correction nécessaire",
  REJECTED: "Refusée",
  CANCELLED: "Annulée",
};

export function getSubscriptionRequestStatusLabel(status: SubscriptionRequestStatus) {
  return labels[status] ?? "En cours";
}
