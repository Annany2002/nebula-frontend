import { useAccountSummary } from "@/hooks/useManagement";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountSummary() {
  const summary = useAccountSummary();
  return (
    <section
      className="account-summary"
      aria-label="Account resources"
      aria-busy={summary.isFetching}
    >
      {summary.isError ? (
        <div className="account-summary-error" role="alert">
          <p>{summary.error.message}</p>
          <Button
            variant="ghost"
            size="sm"
            disabled={summary.isFetching}
            onClick={() => void summary.refetch()}
          >
            Retry totals
          </Button>
        </div>
      ) : (
        <dl>
          {(
            [
              ["database_count", "Databases"],
              ["active_api_key_count", "API keys"],
              ["ready_backup_count", "Saved backups"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>
                {summary.data ? (
                  summary.data[key].toLocaleString()
                ) : (
                  <Skeleton className="h-5 w-8" />
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
