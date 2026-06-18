import { ChoiceCard } from "../molecules/ChoiceCard";
import { getIntentVisual } from "@/lib/member-visuals";

type RegisterIntentStepProps = {
  onFamilyStart: () => void;
  onUnavailable: (title: string) => void;
};

export function RegisterIntentStep({ onFamilyStart, onUnavailable }: RegisterIntentStepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ChoiceCard
        action="Commencer"
        centered
        description="Ajoutez vos enfants et vos grands parents, renouvelez leurs forfaits et suivez leurs dossiers depuis un seul espace."
        imageSrc="/assets/illustrations/register-family.svg"
        onClick={onFamilyStart}
        title="Compte famille"
      />
      <ChoiceCard
        action="Commencez"
        centered
        description="Répondez à quelques questions et obtenez une recommandation adaptée."
        imageSrc={getIntentVisual("personal")}
        onClick={() => onUnavailable("Trouver le bon forfait pour moi")}
        title="Compte personnel"
      />
    </div>
  );
}
