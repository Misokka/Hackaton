import { Button } from "../atoms/Button";

type TablePaginationProps = {
  page: number;
  pageCount: number;
  start: number;
  end: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function TablePagination({
  page,
  pageCount,
  start,
  end,
  total,
  onPrevious,
  onNext,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-neutral-light px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-neutral-medium">{total === 0 ? "0 sur 0" : `${start}-${end} sur ${total}`}</p>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" disabled={page <= 1} onClick={onPrevious}>
          Précédent
        </Button>
        <Button type="button" variant="secondary" disabled={page >= pageCount} onClick={onNext}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
