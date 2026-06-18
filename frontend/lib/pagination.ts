export type PaginationSlice<T> = {
  page: number;
  pageCount: number;
  pageSize: number;
  start: number;
  end: number;
  total: number;
  items: T[];
};

export function paginateItems<T>(items: T[], page: number, pageSize: number): PaginationSlice<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize;
  const end = total === 0 ? 0 : Math.min(start + pageSize, total);

  return {
    page: safePage,
    pageCount,
    pageSize,
    start,
    end,
    total,
    items: items.slice(start, end),
  };
}
