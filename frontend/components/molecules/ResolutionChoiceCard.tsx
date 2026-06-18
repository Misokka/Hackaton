import { Badge } from "../atoms/Badge";

type ResolutionChoiceCardProps = {
  badge?: string;
  consequences?: string[];
  ctaLabel: string;
  description: string;
  note?: string;
  onSelect: () => void;
  selected?: boolean;
  title: string;
};

export function ResolutionChoiceCard({
  badge,
  consequences,
  ctaLabel,
  description,
  note,
  onSelect,
  selected = false,
  title,
}: ResolutionChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex h-full w-full flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-idfm-focus sm:p-5 ${
        selected
          ? "border-idfm-interaction ring-2 ring-idfm-medium"
          : "border-neutral-light hover:border-idfm-interaction hover:shadow-md"
      }`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="text-base font-bold leading-7 text-idfm-anthracite sm:text-lg">{title}</span>
        {badge ? <Badge tone="green">{badge}</Badge> : null}
      </span>
      <span className="mt-2 flex-1">
        <span className="block text-sm leading-6 text-neutral-medium">{description}</span>
        {consequences?.length ? (
          <span className="mt-3 grid gap-2 text-xs leading-5 text-idfm-anthracite">
            {consequences.map((consequence) => (
              <span key={consequence} className="rounded-md bg-neutral-xlight px-3 py-2">
                {consequence}
              </span>
            ))}
          </span>
        ) : null}
        {note ? (
          <span className="mt-3 block rounded-md bg-idfm-light px-3 py-2 text-xs leading-5 text-idfm-anthracite">
            {note}
          </span>
        ) : null}
      </span>
      <span
        className={`mt-4 inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${
          selected
            ? "bg-idfm-interaction text-white"
            : "border border-idfm-interaction text-idfm-interaction"
        }`}
      >
        {ctaLabel}
      </span>
    </button>
  );
}
