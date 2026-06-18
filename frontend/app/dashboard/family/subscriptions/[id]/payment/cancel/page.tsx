"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { InfoBox } from "@/components/molecules/InfoBox";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { cancelStripeCheckoutSession } from "@/lib/api/payments";

function PaymentCancelContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("familyAccessToken");

    if (!accessToken) return;

    void cancelStripeCheckoutSession(accessToken, {
      subscriptionRequestId: params.id,
      sessionId: sessionId ?? undefined,
    }).catch((error: Error) => setMessage(error.message));
  }, [params.id, sessionId]);

  return (
    <DashboardLayout
      activeTab="titles"
      breadcrumbs={[
        { href: "/", label: "Accueil" },
        { href: "/dashboard/family", label: "Mon foyer Navigo" },
        { label: "Paiement annulé" },
      ]}
      subtitle="La demande n'est pas finalisée tant que le paiement n'est pas confirmé."
      summaryItems={["Paiement Stripe", "Annulé"]}
      title="Paiement annulé"
      userName="Mon espace"
    >
      <section className="rounded-md border border-status-warning bg-white p-6 shadow-sm">
        <Badge tone="orange">Paiement annulé</Badge>
        <h2 className="mt-4 text-2xl font-bold text-idfm-anthracite">Votre paiement n&apos;a pas été finalisé</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-medium">
          Aucun paiement réel n&apos;est effectué en mode test. Vous pouvez reprendre le paiement depuis le parcours de souscription.
        </p>
        {message ? <InfoBox className="mt-4" tone="orange">{message}</InfoBox> : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/dashboard/family/subscriptions/imagine-r/new?requestId=${params.id}`} className="contents">
            <Button type="button">Reprendre le paiement</Button>
          </Link>
          <Link href={`/dashboard/family/subscriptions/${params.id}/confirmation`} className="contents">
            <Button type="button" variant="secondary">Voir le suivi du dossier</Button>
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<InfoBox>Chargement du paiement...</InfoBox>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
