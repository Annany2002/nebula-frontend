import { formatDateTime as timestamp } from "@/lib/formatDate";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { RefreshCw, X } from "lucide-react";
import { useAdminRead } from "@/hooks/useManagement";
import { AuditFilters, listAdminAudit, MAX_ADMIN_OFFSET } from "@/lib/management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccessFailure, FilterSelect, LoadingRows, PageControls, ReadError } from "./AdminShared";

export default function AdminAudit({ onAccessError }: { onAccessError: AccessFailure }) {
  const [params, setParams] = useSearchParams();
  const filters: AuditFilters = {
    actor_user_id: params.get("actor_user_id") || "",
    target_user_id: params.get("target_user_id") || "",
    action: (params.get("action") as AuditFilters["action"]) || undefined,
  };
  const requestedOffset = Number(params.get("offset") || "0");
  const offset =
    Number.isInteger(requestedOffset) && requestedOffset > 0 && requestedOffset <= MAX_ADMIN_OFFSET
      ? requestedOffset
      : 0;
  const navigateFilters = (next: AuditFilters, page = 0) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) if (value) query.set(key, value);
    if (page) query.set("offset", String(page));
    setParams(query);
  };
  // URL changes remount only the form/page, so Back, Clear and account deep links stay consistent.
  return (
    <AuditPage
      key={params.toString()}
      filters={filters}
      offset={offset}
      onNavigate={navigateFilters}
      onAccessError={onAccessError}
    />
  );
}

function AuditPage({
  filters,
  offset,
  onNavigate,
  onAccessError,
}: {
  filters: AuditFilters;
  offset: number;
  onNavigate: (filters: AuditFilters, offset?: number) => void;
  onAccessError: AccessFailure;
}) {
  const [draft, setDraft] = useState<AuditFilters>(filters);
  const events = useAdminRead(
    ["audit", filters, offset],
    (signal) => listAdminAudit(filters, offset, signal),
    onAccessError
  );
  const hasFilters = !!(filters.actor_user_id || filters.target_user_id || filters.action);
  return (
    <section aria-labelledby="audit-heading">
      <div className="admin-section-heading">
        <div>
          <h2 id="audit-heading">Audit history</h2>
          <p>
            Suspension and activation events, newest first. Repeated requests create no duplicate
            events.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={events.isFetching}
          onClick={() => void events.refetch()}
        >
          <RefreshCw size={14} aria-hidden="true" /> Refresh history
        </Button>
      </div>
      <form
        className="admin-filters admin-audit-filters"
        onSubmit={(event) => {
          event.preventDefault();
          onNavigate(draft);
        }}
      >
        <Input
          aria-label="Actor account ID"
          placeholder="Actor account ID"
          maxLength={128}
          value={draft.actor_user_id || ""}
          onChange={(event) => setDraft({ ...draft, actor_user_id: event.target.value })}
        />
        <Input
          aria-label="Target account ID"
          placeholder="Target account ID"
          maxLength={128}
          value={draft.target_user_id || ""}
          onChange={(event) => setDraft({ ...draft, target_user_id: event.target.value })}
        />
        <FilterSelect
          label="Filter by action"
          value={draft.action || ""}
          onChange={(event) =>
            setDraft({
              ...draft,
              action: (event.target.value as AuditFilters["action"]) || undefined,
            })
          }
        >
          <option value="">All actions</option>
          <option value="suspend">Suspensions</option>
          <option value="activate">Activations</option>
        </FilterSelect>
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
        {hasFilters && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              onNavigate({});
            }}
          >
            <X size={14} aria-hidden="true" /> Clear
          </Button>
        )}
      </form>
      {events.isPending ? (
        <LoadingRows />
      ) : events.isError ? (
        <ReadError
          error={events.error}
          busy={events.isFetching}
          retry={() => void events.refetch()}
        />
      ) : (
        <>
          {events.data.events.length ? (
            <div
              className="admin-table-wrap"
              role="region"
              aria-label="Audit history table"
              tabIndex={0}
            >
              <table className="admin-table admin-audit-table">
                <caption className="sr-only">Account access transitions</caption>
                <thead>
                  <tr>
                    <th scope="col">Event</th>
                    <th scope="col">Action</th>
                    <th scope="col">Actor</th>
                    <th scope="col">Target</th>
                    <th scope="col">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {events.data.events.map((event) => (
                    <tr key={event.event_id}>
                      <td className="font-mono">#{event.event_id}</td>
                      <td>
                        <span
                          className={`admin-status is-${event.action === "suspend" ? "suspended" : "active"}`}
                        >
                          {event.action === "suspend" ? "Suspended" : "Activated"}
                        </span>
                      </td>
                      <td>
                        <Link
                          className="admin-text-link font-mono"
                          to={`/admin/users?user=${encodeURIComponent(event.actor_user_id)}`}
                        >
                          {event.actor_user_id}
                        </Link>
                      </td>
                      <td>
                        <Link
                          className="admin-text-link font-mono"
                          to={`/admin/users?user=${encodeURIComponent(event.target_user_id)}`}
                        >
                          {event.target_user_id}
                        </Link>
                      </td>
                      <td className="admin-date">{timestamp(event.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">
              <h3>
                {offset
                  ? "No events on this page"
                  : hasFilters
                    ? "No matching events"
                    : "No access changes yet"}
              </h3>
              <p>
                {offset
                  ? "Return to the first page to reload the history."
                  : "Actual suspension and activation changes will appear here. Recorded account IDs remain visible after an account is deleted."}
              </p>
            </div>
          )}
          <PageControls
            page={events.data.pagination}
            count={events.data.events.length}
            busy={events.isFetching}
            onPage={(next) => onNavigate(filters, next)}
          />
        </>
      )}
    </section>
  );
}
