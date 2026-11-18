import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/lib/interface";

type AdminPaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

export function AdminPagination({ pagination, onPageChange }: AdminPaginationProps) {
  const { page, totalPages, total, limit } = pagination;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-neutral-100">
      <p className="text-body-sm text-neutral-500">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-body-sm fw-medium disabled:opacity-40 hover:bg-neutral-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <span className="text-body-sm text-neutral-600 px-2">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-body-sm fw-medium disabled:opacity-40 hover:bg-neutral-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
