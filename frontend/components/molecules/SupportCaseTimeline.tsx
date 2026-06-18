import type { SupportCaseResolution, SupportCaseStatus } from "@/lib/api/types";

type SupportCaseTimelineProps = {
  chosenResolution: SupportCaseResolution | null;
  status: SupportCaseStatus;
};

function isTemporaryTransfer(resolution: SupportCaseResolution | null) {
  return resolution === "TRANSFER_TO_PHONE" || resolution === "TEMPORARY_DIGITAL_TRANSFER";
}

function isReplacementCard(resolution: SupportCaseResolution | null) {
  return resolution === "DEACTIVATE_ONLY" || resolution === "REPLACEMENT_CARD";
}

function buildSteps(chosenResolution: SupportCaseResolution | null) {
  if (isTemporaryTransfer(chosenResolution)) {
    return [
      "Perte declaree",
      "Titre transfere en numerique",
      "En attente d'un eventuel retour du pass",
      "Client notifie si pass retrouve",
      "Choix final du support",
    ];
  }

  if (isReplacementCard(chosenResolution)) {
    return [
      "Perte declaree",
      "Pass desactive",
      "Nouvelle carte demandee",
      "Nouvelle carte en preparation",
      "Dossier cloture",
    ];
  }

  return [
    "Perte declaree",
    "Pass physique desactive",
    "Titre transfere definitivement en numerique",
    "Dossier cloture",
  ];
}

function getActiveIndex(status: SupportCaseStatus, chosenResolution: SupportCaseResolution | null) {
  if (isTemporaryTransfer(chosenResolution)) {
    switch (status) {
      case "OPEN":
        return 0;
      case "IN_PROGRESS":
        return 1;
      case "TRANSFER_TO_PHONE_REQUESTED":
        return 2;
      case "PASS_FOUND_WAITING_PICKUP":
        return 3;
      case "PASS_PICKED_UP":
      case "DIGITAL_SUPPORT_CONFIRMED":
      case "PHYSICAL_PASS_REACTIVATION_REQUESTED":
      case "PHYSICAL_PASS_REACTIVATED":
      case "RESOLVED":
        return 4;
      default:
        return 0;
    }
  }

  if (isReplacementCard(chosenResolution)) {
    switch (status) {
      case "OPEN":
        return 0;
      case "IN_PROGRESS":
        return 1;
      case "PASS_DEACTIVATION_REQUESTED":
        return 2;
      case "RESOLVED":
        return 4;
      default:
        return 2;
    }
  }

  switch (status) {
    case "OPEN":
      return 0;
    case "IN_PROGRESS":
      return 1;
    case "PERMANENT_DIGITAL_TRANSFER_REQUESTED":
    case "DIGITAL_SUPPORT_CONFIRMED":
    case "RESOLVED":
      return 3;
    default:
      return 0;
  }
}

export function SupportCaseTimeline({ chosenResolution, status }: SupportCaseTimelineProps) {
  const steps = buildSteps(chosenResolution);
  const isCancelled = status === "CANCELLED_BY_USER";
  const activeIndex = getActiveIndex(status, chosenResolution);

  return (
    <ol className="grid gap-0">
      {steps.map((step, index) => {
        const completed = !isCancelled && index < activeIndex;
        const active = !isCancelled && index === activeIndex;
        const isLast = index === steps.length - 1;

        return (
          <li key={step} className="grid grid-cols-[auto_1fr] gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  completed
                    ? "border-status-success bg-status-success text-white"
                    : active
                      ? "border-idfm-interaction bg-idfm-interaction text-white"
                      : "border-neutral-light bg-white text-neutral-medium"
                }`}
                aria-hidden="true"
              >
                {completed ? "✓" : index + 1}
              </span>
              {!isLast ? (
                <span
                  className={`min-h-8 w-0.5 flex-1 ${
                    completed ? "bg-status-success" : "bg-neutral-light"
                  }`}
                />
              ) : null}
            </div>
            <div className={isLast ? "pb-0 pt-0.5" : "pb-6 pt-0.5"}>
              <p
                className={`text-sm font-semibold ${
                  active ? "text-idfm-focus" : completed ? "text-idfm-anthracite" : "text-neutral-medium"
                }`}
              >
                {step}
              </p>
              {active ? (
                <p className="mt-1 text-xs text-neutral-medium">Etape en cours</p>
              ) : null}
            </div>
          </li>
        );
      })}

      {isCancelled ? (
        <li className="mt-2 rounded-md border border-status-danger bg-red-50 p-3 text-sm font-semibold text-status-danger">
          Declaration annulee par vos soins.
        </li>
      ) : null}
    </ol>
  );
}
