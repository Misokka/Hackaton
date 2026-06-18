"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { FormError } from "../atoms/FormError";
import { ChoiceCard } from "../molecules/ChoiceCard";
import { InfoBox } from "../molecules/InfoBox";
import { ResolutionChoiceCard } from "../molecules/ResolutionChoiceCard";
import { StatusBadge } from "../molecules/StatusBadge";
import { StepIndicator } from "../molecules/StepIndicator";
import { SupportCaseTimeline } from "../molecules/SupportCaseTimeline";
import {
  formatSupportCaseDate,
  lostPassReasonLabels,
  resolutionLabels,
  simulateMaskedPass,
  supportCaseStatusLabels,
} from "@/lib/supportCases";
import type {
  DashboardMember,
  LostPassPayload,
  LostPassReason,
  LostPassResponse,
  SupportCaseResolution,
} from "@/lib/api/types";

type LostPassFlowProps = {
  defaultMemberId?: string;
  isOpen: boolean;
  isSubmitting?: boolean;
  members: DashboardMember[];
  onClose: () => void;
  onSubmit: (payload: LostPassPayload) => Promise<LostPassResponse>;
};

const STEP_LABELS = ["Profil", "Raison", "Solution", "Confirmation"];

const REASON_OPTIONS: Array<{ value: LostPassReason; title: string; description: string }> = [
  { value: "LOST", title: "J'ai perdu mon pass", description: "Le pass est introuvable." },
  { value: "STOLEN", title: "Mon pass a ete vole", description: "Le pass a ete derobe." },
  { value: "DAMAGED", title: "Mon pass est endommage", description: "Le pass ne fonctionne plus." },
  { value: "UNKNOWN", title: "Je ne sais pas", description: "La situation n'est pas claire." },
];

function getResolutionConsequences(resolution: SupportCaseResolution | null) {
  switch (resolution) {
    case "TRANSFER_TO_PHONE":
    case "TEMPORARY_DIGITAL_TRANSFER":
    case "DEACTIVATE_ONLY":
    case "REPLACEMENT_CARD":
    case "PERMANENT_DIGITAL_TRANSFER":
    default:
      return [];
  }
}

function getResolutionConfirmationLabel(resolution: SupportCaseResolution | null) {
  switch (resolution) {
    case "TRANSFER_TO_PHONE":
    case "TEMPORARY_DIGITAL_TRANSFER":
      return "Transfert numerique temporaire demande";
    case "DEACTIVATE_ONLY":
    case "REPLACEMENT_CARD":
      return "Nouvelle carte demandee";
    case "PERMANENT_DIGITAL_TRANSFER":
      return "Passage definitif en numerique";
    default:
      return "—";
  }
}

function profileTypeLabel(profileType: DashboardMember["profileType"]) {
  switch (profileType) {
    case "MANAGER":
      return "Gestionnaire du foyer";
    case "YOUNG":
      return "Enfant / jeune";
    case "SENIOR":
      return "Senior / retraite";
    default:
      return "Profil accompagne";
  }
}

export function LostPassFlow({
  defaultMemberId,
  isOpen,
  isSubmitting = false,
  members,
  onClose,
  onSubmit,
}: LostPassFlowProps) {
  const singleMember = members.length === 1;
  const initialStep = singleMember ? 1 : 0;

  const [step, setStep] = useState(initialStep);
  const [memberId, setMemberId] = useState(defaultMemberId ?? members[0]?.id ?? "");
  const [reason, setReason] = useState<LostPassReason | null>(null);
  const [resolution, setResolution] = useState<SupportCaseResolution | null>(null);
  const [understands, setUnderstands] = useState(false);
  const [error, setError] = useState("");
  const [createdCase, setCreatedCase] = useState<LostPassResponse["supportCase"] | null>(null);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === memberId) ?? null,
    [members, memberId],
  );

  if (!isOpen) {
    return null;
  }

  const titleLabel =
    selectedMember?.currentProduct ?? selectedMember?.recommendedProduct ?? null;
  const maskedPass = selectedMember ? simulateMaskedPass(selectedMember.id) : null;

  function goToReason(nextMemberId: string) {
    setMemberId(nextMemberId);
    setError("");
    setStep(1);
  }

  function selectReason(value: LostPassReason) {
    setReason(value);
    setError("");
    setStep(2);
  }

  function selectResolution(value: SupportCaseResolution) {
    setResolution(value);
    setError("");
    setStep(3);
  }

  async function handleConfirm() {
    if (!memberId || !reason || !resolution) {
      setError("Une etape est incomplete.");
      return;
    }

    if (!understands) {
      setError("Vous devez confirmer avoir compris la consequence.");
      return;
    }

    setError("");

    try {
      const response = await onSubmit({
        memberId,
        reason,
        chosenResolution: resolution,
        understandsDeactivation: true,
      });
      setShowFinalConfirm(false);
      setCreatedCase(response.supportCase);
      setStep(4);
    } catch (submitError) {
      setShowFinalConfirm(false);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "La declaration n'a pas pu etre enregistree.",
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-idfm-anthracite/55 px-0 sm:items-center sm:px-5"
      role="dialog"
      aria-modal="true"
      aria-label="Declarer un passe perdu"
    >
      <div
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl ${
          step === 2 ? "max-w-6xl" : step === 3 ? "max-w-3xl" : "max-w-2xl"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-light p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-idfm-interaction">SOS Navigo</p>
            <h2 className="mt-1 text-xl font-bold text-idfm-anthracite sm:text-2xl">
              Declarer un passe perdu
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-light text-neutral-medium transition hover:bg-neutral-xlight"
          >
            ✕
          </button>
        </div>

        {step < 4 ? (
          <div className="border-b border-neutral-light px-5 py-4">
            <StepIndicator currentStep={step} steps={STEP_LABELS} />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto p-5">
          {/* Etape 1 — Profil */}
          {step === 0 ? (
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-bold text-idfm-anthracite">Quel pass avez-vous perdu ?</h3>
                <p className="mt-1 text-sm text-neutral-medium">
                  Selectionnez le profil concerne par la perte.
                </p>
              </div>
              {members.length === 0 ? (
                <InfoBox tone="orange">Aucun profil n&apos;est rattache a votre foyer.</InfoBox>
              ) : (
                <div className="grid gap-3">
                  {members.map((member) => {
                    const memberTitle = member.currentProduct ?? member.recommendedProduct;
                    const alreadyDeclared = member.status === "LOST";
                    const canDeclare = member.hasActiveTitle && !alreadyDeclared;
                    return (
                      <div
                        key={member.id}
                        className="flex flex-col gap-3 rounded-2xl border border-neutral-light bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-idfm-anthracite">
                              {member.firstName} {member.lastName}
                            </p>
                            <StatusBadge status={member.status} />
                          </div>
                          <p className="mt-1 text-sm text-neutral-medium">
                            {profileTypeLabel(member.profileType)}
                          </p>
                          {member.hasActiveTitle && memberTitle ? (
                            <p className="mt-1 text-sm text-idfm-anthracite">
                              {memberTitle}
                              <span className="ml-2 text-neutral-medium">
                                Pass {simulateMaskedPass(member.id)}
                              </span>
                            </p>
                          ) : (
                            <p className="mt-1 text-sm text-neutral-medium">
                              Aucun pass actif rattache a ce profil.
                            </p>
                          )}
                          {alreadyDeclared ? (
                            <p className="mt-1 text-sm font-semibold text-idfm-interaction">
                              Une declaration est deja en cours pour ce profil.
                            </p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={!canDeclare}
                          onClick={() => goToReason(member.id)}
                        >
                          {alreadyDeclared
                            ? "Deja declare"
                            : !member.hasActiveTitle
                              ? "Aucun pass"
                              : "Selectionner"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          {/* Etape 2 — Raison */}
          {step === 1 ? (
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-bold text-idfm-anthracite">Que s&apos;est-il passe ?</h3>
                <p className="mt-1 text-sm text-neutral-medium">
                  {selectedMember
                    ? `Profil concerne : ${selectedMember.firstName} ${selectedMember.lastName}.`
                    : "Choisissez la situation la plus proche."}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {REASON_OPTIONS.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    description={option.description}
                    action="Choisir"
                    onClick={() => selectReason(option.value)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Etape 3 — Resolution */}
          {step === 2 ? (
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-bold text-idfm-anthracite">Comment souhaitez-vous continuer ?</h3>
                <p className="mt-1 text-sm text-neutral-medium">
                  Choisissez simplement la suite la plus adaptee.
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <ResolutionChoiceCard
                  badge="Continuer a voyager"
                  title="Transferer temporairement mon titre en numerique"
                  description="Vous continuez a voyager sur votre smartphone pendant le traitement."
                  consequences={getResolutionConsequences("TEMPORARY_DIGITAL_TRANSFER")}
                  note="Si le pass est retrouve, vous choisirez plus tard entre digital et physique."
                  ctaLabel="Choisir cette option"
                  selected={resolution === "TEMPORARY_DIGITAL_TRANSFER"}
                  onSelect={() => selectResolution("TEMPORARY_DIGITAL_TRANSFER")}
                />
                <ResolutionChoiceCard
                  badge="Nouvelle carte"
                  title="Desactiver mon pass et demander une nouvelle carte"
                  description="Le pass perdu est stoppe et une nouvelle carte est demandee."
                  consequences={getResolutionConsequences("REPLACEMENT_CARD")}
                  note="A choisir si vous ne souhaitez pas utiliser le support numerique."
                  ctaLabel="Choisir cette option"
                  selected={resolution === "REPLACEMENT_CARD"}
                  onSelect={() => selectResolution("REPLACEMENT_CARD")}
                />
                <ResolutionChoiceCard
                  badge="100 % numerique"
                  title="Passer definitivement en support numerique"
                  description="Votre titre passe en numerique de facon durable."
                  consequences={getResolutionConsequences("PERMANENT_DIGITAL_TRANSFER")}
                  note="Aucune nouvelle carte physique n'est prevue."
                  ctaLabel="Choisir cette option"
                  selected={resolution === "PERMANENT_DIGITAL_TRANSFER"}
                  onSelect={() => selectResolution("PERMANENT_DIGITAL_TRANSFER")}
                />
              </div>
            </div>
          ) : null}

          {/* Etape 4 — Double confirmation */}
          {step === 3 ? (
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-bold text-idfm-anthracite">Confirmer la declaration de perte</h3>
                <p className="mt-1 text-sm text-neutral-medium">Verifiez le recapitulatif avant de confirmer.</p>
              </div>

              <dl className="grid gap-3 rounded-2xl border border-neutral-light bg-neutral-xlight p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-medium">Profil concerne</dt>
                  <dd className="text-right font-semibold text-idfm-anthracite">
                    {selectedMember
                      ? `${selectedMember.firstName} ${selectedMember.lastName}`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-medium">Titre concerne</dt>
                  <dd className="text-right font-semibold text-idfm-anthracite">{titleLabel ?? "Titre Navigo"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-medium">Numero de pass</dt>
                  <dd className="text-right font-semibold text-idfm-anthracite">{maskedPass ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-medium">Raison</dt>
                  <dd className="text-right font-semibold text-idfm-anthracite">
                    {reason ? lostPassReasonLabels[reason] : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-medium">Option choisie</dt>
                  <dd className="text-right font-semibold text-idfm-anthracite">
                    {resolution ? resolutionLabels[resolution] : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-medium">Consequence</dt>
                  <dd className="text-right font-semibold text-idfm-anthracite">
                    {getResolutionConfirmationLabel(resolution)}
                  </dd>
                </div>
              </dl>

              <div className="grid gap-2 rounded-2xl border border-neutral-light bg-white p-4 text-sm text-idfm-anthracite">
                <p className="font-semibold">Consequences principales</p>
                {getResolutionConsequences(resolution).map((consequence) => (
                  <p key={consequence}>- {consequence}</p>
                ))}
              </div>

              <InfoBox tone="orange">
                Une fois confirmee, cette declaration peut entrainer la desactivation du pass physique.
                Vous pourrez annuler la declaration uniquement tant qu&apos;elle n&apos;est pas traitee par un agent.
              </InfoBox>

              <Checkbox
                name="lost-pass-understands"
                checked={understands}
                onChange={(event) => setUnderstands(event.target.checked)}
                label="Je comprends les consequences de cette declaration."
              />
            </div>
          ) : null}

          {/* Etape 5 — Confirmation */}
          {step === 4 && createdCase ? (
            <div className="grid gap-5">
              <InfoBox tone="green">Votre declaration a bien ete enregistree.</InfoBox>

              <div className="grid gap-3 rounded-2xl border border-neutral-light bg-neutral-xlight p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-medium">Numero de dossier</span>
                  <span className="font-semibold text-idfm-anthracite">{createdCase.dossierNumber}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-medium">Date</span>
                  <span className="font-semibold text-idfm-anthracite">
                    {formatSupportCaseDate(new Date().toISOString())}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-medium">Statut</span>
                  <span className="font-semibold text-idfm-anthracite">
                    {supportCaseStatusLabels[createdCase.status]}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-medium">Profil concerne</span>
                  <span className="font-semibold text-idfm-anthracite">
                    {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-medium">Option choisie</span>
                  <span className="font-semibold text-idfm-anthracite">
                    {resolution ? resolutionLabels[resolution] : "—"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-light bg-white p-4">
                <p className="mb-3 text-sm font-bold text-idfm-anthracite">Suivi de la demande</p>
                <SupportCaseTimeline chosenResolution={resolution} status={createdCase.status} />
              </div>
            </div>
          ) : null}

          <div className="mt-4">
            <FormError message={error} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-neutral-light p-5">
          {step === 3 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                Retour
              </Button>
              <Button
                type="button"
                disabled={!understands || isSubmitting}
                onClick={() => {
                  setError("");
                  setShowFinalConfirm(true);
                }}
              >
                {isSubmitting ? "Enregistrement..." : "Confirmer la declaration"}
              </Button>
            </div>
          ) : null}

          {step === 4 && createdCase ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={`/dashboard/family/support-cases/${createdCase.id}`}
                className="contents"
                onClick={onClose}
              >
                <Button type="button" className="w-full">Voir le suivi</Button>
              </Link>
              <Button type="button" variant="secondary" onClick={onClose}>
                Retour a mon espace
              </Button>
            </div>
          ) : null}

          {step !== 3 && step !== 4 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {step > initialStep ? (
                <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)}>
                  Retour
                </Button>
              ) : (
                <Button type="button" variant="secondary" onClick={onClose}>
                  Annuler
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={onClose}>
                Fermer
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Double verification finale avant action definitive */}
      {showFinalConfirm ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-idfm-anthracite/60 px-5"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmation definitive"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-idfm-anthracite">
              {resolution === "PERMANENT_DIGITAL_TRANSFER"
                ? "Confirmer le passage definitif en numerique ?"
                : resolution === "REPLACEMENT_CARD" || resolution === "DEACTIVATE_ONLY"
                  ? "Confirmer la demande de nouvelle carte ?"
                  : "Confirmer le transfert numerique temporaire ?"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-medium">
              {resolution === "PERMANENT_DIGITAL_TRANSFER"
                ? "Votre pass physique perdu sera desactive. Le titre restera sur support numerique et aucun nouveau pass physique ne sera demande."
                : resolution === "REPLACEMENT_CARD" || resolution === "DEACTIVATE_ONLY"
                  ? "Votre pass physique sera desactive et une demande de nouvelle carte sera enregistree."
                  : "Votre pass physique sera considere comme perdu et votre titre sera disponible temporairement sur smartphone jusqu'au choix final."}
            </p>

            <div className="mt-3">
              <FormError message={error} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => setShowFinalConfirm(false)}
              >
                Retour
              </Button>
              <Button type="button" disabled={isSubmitting} onClick={() => void handleConfirm()}>
                {isSubmitting
                  ? "Traitement..."
                  : resolution === "PERMANENT_DIGITAL_TRANSFER"
                    ? "Passer en numerique"
                    : resolution === "REPLACEMENT_CARD" || resolution === "DEACTIVATE_ONLY"
                      ? "Demander une nouvelle carte"
                      : "Activer le numerique temporaire"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
