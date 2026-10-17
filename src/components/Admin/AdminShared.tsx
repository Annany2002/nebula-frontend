import { useId, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_PAGE_SIZE, MAX_ADMIN_OFFSET, ManagementError, Pagination } from "@/lib/management";

export type AccessFailure = (error: ManagementError) => void;

export function FilterSelect({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId();
  return (
    <div className="admin-select">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} {...props}>
        {children}
      </select>
      <ChevronDown size={14} aria-hidden="true" />
    </div>
  );
}

export function ReadError({
  error,
  retry,
  busy,
}: {
  error: Error;
  retry: () => void;
  busy: boolean;
}) {
  return (
    <div className="admin-notice" role="alert">
      <p>{error.message}</p>
      <Button variant="outline" size="sm" onClick={retry} disabled={busy}>
        Try again
      </Button>
    </div>
  );
}
export function LoadingRows() {
  return (
    <div role="status" aria-label="Loading records" className="admin-loading">
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} className="h-14 w-full" />
      ))}
    </div>
  );
}
export function PageControls({
  page,
  count,
  busy,
  onPage,
}: {
  page: Pagination;
  count: number;
  busy: boolean;
  onPage: (offset: number) => void;
}) {
  const last = Math.min(page.offset + count, page.total);
  return (
    <div className="admin-pagination">
      <p role="status">
        {count
          ? `${(page.offset + 1).toLocaleString()}–${last.toLocaleString()} of ${page.total.toLocaleString()}`
          : `${page.total.toLocaleString()} total`}
      </p>
      <div>
        {page.offset > 0 && (
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => onPage(0)}>
            First page
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={busy || page.offset === 0}
          onClick={() => onPage(Math.max(0, page.offset - ADMIN_PAGE_SIZE))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={
            busy ||
            last >= page.total ||
            page.offset + ADMIN_PAGE_SIZE > MAX_ADMIN_OFFSET ||
            count === 0
          }
          onClick={() => onPage(page.offset + ADMIN_PAGE_SIZE)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
