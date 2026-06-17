"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { InfoBox } from "@/components/molecules/InfoBox";
import { OfferCard } from "@/components/molecules/OfferCard";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { getMyHouseholdDashboard } from "@/lib/api/households";
import { getTitleOffers } from "@/lib/api/titles";
import type { HouseholdDashboardResponse, ProductOffer } from "@/lib/api/types";
import { familyDashboardMock } from "@/lib/demo/familyDashboardMock";
import { titleOffersMock } from "@/lib/demo/titleOffersMock";

type TitlesPageState = {
  dashboard: HouseholdDashboardResponse;
  offers: ProductOffer[];
  isDemo: boolean;
};

function buildSummaryItems(data: HouseholdDashboardResponse) {
  return [
    `Bonjour ${data.manager.firstName}`,
    `${data.summary.membersCount} profils suivis`,
    `${data.summary.offersToCheckCount} offre a etudier`,
    "0 titre actif",
  ];
}

function getMemberTitleStatus(member: HouseholdDashboardResponse["members"][number]) {
  if (member.pendingRequest || member.status === "PENDING_DOCUMENT") {
    return "Demande en cours";
  }

  if (member.currentProduct) {
    return "Titre rattache";
  }

  return member.profileType === "MANAGER" ? "Aucun titre rattache" : "Offre a choisir";
}

function getRequestStatusLabel(status: NonNullable<HouseholdDashboardResponse["members"][number]["pendingRequest"]>["status"]) {
  if (status === "DRAFT") {
    return "Brouillon";
  }

  if (status === "WAITING_DOCUMENTS") {
    return "Justificatifs attendus";
  }

  if (status === "UNDER_REVIEW") {
    return "En vérification";
  }

  if (status === "PAYMENT_PENDING") {
    return "Paiement à confirmer";
  }

  if (status === "CONFIRMED") {
    return "Confirmée";
  }

  return "En cours";
}

function FamilyTitlesContent() {
  const [state, setState] = useState<TitlesPageState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("familyAccessToken");

    async function loadData() {
      try {
        const [dashboard, offers] = await Promise.all([
          accessToken ? getMyHouseholdDashboard(accessToken) : Promise.resolve(familyDashboardMock),
          getTitleOffers().catch(() => titleOffersMock),
        ]);

        setState({ dashboard, offers, isDemo: !accessToken });
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Chargement impossible.");
        setState({ dashboard: familyDashboardMock, offers: titleOffersMock, isDemo: true });
      }
    }

    void loadData();
  }, []);

  const data = state?.dashboard ?? familyDashboardMock;
  const offers = state?.offers ?? titleOffersMock;
  const pendingMembers = data.members.filter((member) => member.pendingRequest);

  return (
    <DashboardLayout
      activeTab="titles"
      breadcrumbs={[
        { href: "/", label: "Accueil" },
        { href: "/dashboard/family", label: "Mon foyer Navigo" },
        { label: "Titres" },
      ]}
      subtitle="Choisissez le bon titre pour chaque profil du foyer, sans creer d'abonnement automatique."
      summaryItems={buildSummaryItems(data)}
      title="Titres et offres Navigo"
      userName={state ? data.manager.firstName : "Mon espace"}
    >
      <div className="grid gap-10">
        {state?.isDemo || loadError ? (
          <InfoBox>
            {loadError ?? "Mode demo : les offres restent consultables meme sans session active."}
          </InfoBox>
        ) : null}

        <section className="grid gap-6 rounded-3xl border border-idfm-medium bg-idfm-light p-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <Badge tone="blue">Assistant titres</Badge>
            <h2 className="mt-4 text-3xl font-bold text-idfm-anthracite">Trouver le bon titre pour un proche</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-medium">
              Selectionnez un profil, repondez a quelques questions, puis preparez une demande de souscription.
            </p>
          </div>
          <Link
            href="/dashboard/family/titles/recommendation"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-idfm-interaction px-5 text-sm font-semibold text-white transition hover:bg-idfm-focus focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-idfm-focus"
          >
            Trouver le bon titre
          </Link>
        </section>

        <section>
          {pendingMembers.length ? (
            <div className="mb-10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-idfm-anthracite">Demandes en attente</h2>
                  <p className="mt-1 text-sm text-neutral-medium">
                    Suivez les dossiers envoyés avant qu'un titre soit rattaché au foyer.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {pendingMembers.map((member) => {
                  const request = member.pendingRequest;

                  if (!request) {
                    return null;
                  }

                  return (
                    <article key={request.id} className="flex h-full flex-col rounded-2xl border border-status-warning bg-orange-50 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-idfm-anthracite">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-medium">{request.offerName}</p>
                        </div>
                        <Badge tone="orange">{getRequestStatusLabel(request.status)}</Badge>
                      </div>
                      <p className="mt-4 flex-1 text-sm leading-6 text-neutral-medium">
                        Dossier {request.requestNumber ?? "enregistré"} : les informations et justificatifs peuvent être suivis depuis votre espace.
                      </p>
                      <Link
                        href={`/dashboard/family/subscriptions/${request.id}/confirmation`}
                        className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-idfm-interaction px-5 text-sm font-semibold text-white transition hover:bg-idfm-focus focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-idfm-focus"
                      >
                        Voir l'état de ma demande
                      </Link>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-idfm-anthracite">Titres du foyer</h2>
              <p className="mt-1 text-sm text-neutral-medium">
                Aucun abonnement actif n'est cree automatiquement. Chaque profil choisit d'abord une offre.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {data.members.map((member) => {
              const actionHref = member.pendingRequest
                ? `/dashboard/family/subscriptions/${member.pendingRequest.id}/confirmation`
                : `/dashboard/family/titles/recommendation?memberId=${member.id}`;

              return (
                <article key={member.id} className="flex h-full flex-col rounded-2xl border border-neutral-light bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-idfm-anthracite">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-medium">{member.relationLabel}</p>
                    </div>
                    <Badge tone={member.pendingRequest || member.status === "PENDING_DOCUMENT" ? "orange" : "blue"}>
                      {getMemberTitleStatus(member)}
                    </Badge>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-6 text-neutral-medium">
                    {member.pendingRequest
                      ? `${member.pendingRequest.offerName} — ${getRequestStatusLabel(member.pendingRequest.status)}.`
                      : member.recommendedProduct
                        ? `Offre reperee : ${member.recommendedProduct}`
                        : "Aucun titre rattache pour le moment."}
                  </p>
                  <Link
                    href={actionHref}
                    className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-idfm-interaction px-5 text-sm font-semibold text-white transition hover:bg-idfm-focus focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-idfm-focus"
                  >
                    {member.pendingRequest ? "Voir l'état de ma demande" : "Trouver une offre"}
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-idfm-anthracite">Offres utiles</h2>
          <p className="mt-1 text-sm text-neutral-medium">
            Les principales offres du MVP, avec les documents a prevoir avant de demarrer.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} href={`/dashboard/family/titles/offers/${offer.slug}`} />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default function FamilyTitlesPage() {
  return (
    <Suspense fallback={<InfoBox>Chargement des titres...</InfoBox>}>
      <FamilyTitlesContent />
    </Suspense>
  );
}
