import { useAdminRead } from "@/hooks/useManagement";
import { getPlatformStats } from "@/lib/management";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessFailure, ReadError } from "./AdminShared";

export default function PlatformStats({ onAccessError }: { onAccessError: AccessFailure }) {
  const stats = useAdminRead(["stats"], getPlatformStats, onAccessError);
  return (
    <section className="admin-stats" aria-labelledby="platform-counts" aria-busy={stats.isFetching}>
      <div className="admin-section-heading">
        <h2 id="platform-counts">Platform overview</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void stats.refetch()}
          disabled={stats.isFetching}
        >
          Refresh counts
        </Button>
      </div>
      {stats.isError ? (
        <ReadError error={stats.error} busy={stats.isFetching} retry={() => void stats.refetch()} />
      ) : (
        <>
          <dl>
            {(
              [
                ["total_users", "Accounts"],
                ["total_databases", "Databases"],
                ["total_tables", "Tables"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  {stats.data ? (
                    stats.data[key] === null ? (
                      "Unavailable"
                    ) : (
                      stats.data[key].toLocaleString()
                    )
                  ) : (
                    <Skeleton className="h-7 w-14" />
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {stats.data && stats.data.databases_unavailable > 0 && (
            <p className="admin-completeness" role="status">
              Table count is incomplete: {stats.data.databases_counted} databases inspected,{" "}
              {stats.data.databases_unavailable} unavailable.
            </p>
          )}
        </>
      )}
    </section>
  );
}
