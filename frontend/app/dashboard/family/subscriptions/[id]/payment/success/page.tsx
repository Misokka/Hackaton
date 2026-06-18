"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { InfoBox } from "@/components/molecules/InfoBox";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { getSubscriptionRequest } from "@/lib/api/subscriptions";
import { confirmStripeCheckoutSession } from "@/lib/api/payments";
import type { SubscriptionRequestResponse } from "@/lib/api/types";
import { getSubscriptionRequestStatusLabel } from "@/lib/subscription-status";

function PaymentSuccessContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [request, setRequest] = useState<SubscriptionRequestResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function confirmPayment() {
      const accessToken = localStorage.getItem("familyAccessToken");

      if (!accessToken || !sessionId) {
        throw new Error("Impossible de confirmer le paiement : session Stripe manquante.");
      }

      await confirmStripeCheckoutSession(accessToken, sessionId);
      const updatedRequest = await getSubscriptionRequest(accessToken, params.id);

      if (isMounted) {
        setRequest(updatedRequest);
      }
    }

    void confirmPayment()
      .catch((error: Error) => {
        if (isMounted) setMessage(error.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.id, sessionId]);

  return (
    <DashboardLayout
      activeTab="titles"
      breadcrumbs={[
        { href: "/", label: "Accueil" },
        { href: "/dashboard/family", label: "Mon foyer Navigo" },
        { href: `/dashboard/family/subscriptions/${params.id}/confirmation`, label: "Suivi" },
        { label: "Paiement confirmé" },
      ]}
      subtitle="Le paiement Stripe test est confirmé. Le dossier part en vérification."
      summaryItems={request ? [request.offer.name, getSubscriptionRequestStatusLabel(request.status)] : ["Paiement Stripe"]}
      title="Paiement confirmé"
      userName={request?.payer.firstName ?? "Mon espace"}
    >
      <div className="grid gap-6">
        {isLoading ? <InfoBox>Confirmation du paiement Stripe...</InfoBox> : null}
        {message ? <InfoBox tone="red">{message}</InfoBox> : null}

        {request ? (
          <section className="rounded-md border border-status-success bg-white p-6 shadow-sm">
            <Badge tone="green">Paiement confirmé</Badge>
            <h2 className="mt-4 text-2xl font-bold text-idfm-anthracite">{request.offer.name}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-medium">
              Le paiement a été validé en mode test. Le dossier de {request.member.firstName} {request.member.lastName} passe maintenant en vérification.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-idfm-light p-4">
                <p className="text-sm text-neutral-medium">Total payé</p>
                <p className="font-bold text-idfm-anthracite">
                  {request.imagineR?.totalAmountCents
                    ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(request.imagineR.totalAmountCents / 100)
                    : request.offer.priceLabel}
                </p>
              </div>
              <div className="rounded-md bg-idfm-light p-4">
                <p className="text-sm text-neutral-medium">Statut</p>
                <p className="font-bold text-idfm-anthracite">{getSubscriptionRequestStatusLabel(request.status)}</p>
              </div>
              <div className="rounded-md bg-idfm-light p-4">
                <p className="text-sm text-neutral-medium">Dossier</p>
                <p className="font-bold text-idfm-anthracite">{request.requestNumber ?? request.id}</p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={`/dashboard/family/subscriptions/${params.id}/confirmation`} className="contents">
            <Button type="button">Voir le suivi du dossier</Button>
          </Link>
          <Link href="/dashboard/family" className="contents">
            <Button type="button" variant="secondary">Retour à mon espace famille</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<InfoBox>Confirmation du paiement...</InfoBox>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
