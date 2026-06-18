import type { SubscriptionRequestStatus } from "./api/types";

const labels: Record<SubscriptionRequestStatus, string> = {
  DRAFT: "Brouillon",
  WAITING_DOCUMENTS: "Justificatifs attendus",
  PAYMENT_PENDING: "Paiement à confirmer",
  UNDER_REVIEW: "En vérification",
  CONFIRMED: "Confirmée",
  ACTIVE: "Active",
  BLOCKED: "Bloquée",
  CANCELLED: "Annulée",
};

export function getSubscriptionRequestStatusLabel(status: SubscriptionRequestStatus) {
  return labels[status] ?? "En cours";
}
