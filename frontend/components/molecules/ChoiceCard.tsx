import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "../atoms/Badge";
import { IconPlaceholder } from "../atoms/IconPlaceholder";

type ChoiceCardProps = {
  action?: ReactNode;
  badge?: string;
  centered?: boolean;
  description: string;
  icon?: string;
  imageSrc?: string;
  onClick?: () => void;
  title: string;
};

export function ChoiceCard({ action, badge, centered = false, description, icon, imageSrc, onClick, title }: ChoiceCardProps) {
  const visual = imageSrc ? (
    <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-idfm-light">
      <Image src={imageSrc} alt="" width={96} height={96} className="h-16 w-16 object-contain" aria-hidden="true" />
    </span>
  ) : (
    <IconPlaceholder label={title} src={icon} />
  );

  if (centered) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex h-full min-h-72 w-full flex-col items-center rounded-md border border-neutral-light bg-white p-6 text-center shadow-sm transition hover:border-idfm-interaction hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-idfm-focus"
      >
        {badge ? (
          <span className="mb-3 self-center">
            <Badge tone={badge === "Actif" ? "green" : "orange"}>{badge}</Badge>
          </span>
        ) : null}
        <span className="text-xl font-bold text-idfm-anthracite">{title}</span>
        <span className="mt-5">{visual}</span>
        <span className="mt-5 flex-1 text-sm leading-6 text-neutral-medium">{description}</span>
        {action ? <span className="mt-6 text-sm font-bold text-idfm-interaction">{action}</span> : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col rounded-md border border-neutral-light bg-white p-5 text-left shadow-sm transition hover:border-idfm-interaction hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-idfm-focus"
    >
      <span className="mb-4 flex items-start justify-between gap-3">
        {visual}
        {badge ? <Badge tone={badge === "Actif" ? "green" : "orange"}>{badge}</Badge> : null}
      </span>
      <span className="text-lg font-bold text-idfm-anthracite">{title}</span>
      <span className="mt-2 flex-1 text-sm leading-6 text-neutral-medium">{description}</span>
      {action ? <span className="mt-5 text-sm font-bold text-idfm-interaction">{action}</span> : null}
    </button>
  );
}
