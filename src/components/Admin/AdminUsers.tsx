import { formatDateTime as timestamp } from "@/lib/formatDate";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, RefreshCw, X } from "lucide-react";
import { useAdminRead } from "@/hooks/useManagement";
import { listAdminUsers, UserFilters } from "@/lib/management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccessFailure, FilterSelect, LoadingRows, PageControls, ReadError } from "./AdminShared";
import AdminUserDetails from "./AdminUserDetails";

const emptyFilters: UserFilters = { q: "", role: undefined, status: undefined };

export default function AdminUsers({ onAccessError }: { onAccessError: AccessFailure }) {
  const [draft, setDraft] = useState<UserFilters>(emptyFilters);
  const [filters, setFilters] = useState<UserFilters>(emptyFilters);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [params, setParams] = useSearchParams();
  const selected = params.get("user");
  const users = useAdminRead(
    ["users", filters, offset],
    (signal) => listAdminUsers(filters, offset, signal),
    onAccessError
  );
  const clear = () => {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setOffset(0);
  };
  const hasFilters = !!(filters.q || filters.role || filters.status);
  return (
    <section aria-labelledby="users-heading">
      <div className="admin-section-heading">
        <div>
          <h2 id="users-heading">Users</h2>
          <p>Search accounts and manage platform access.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={users.isFetching || busy}
          onClick={() => void users.refetch()}
        >
          <RefreshCw size={14} aria-hidden="true" /> Refresh users
        </Button>
      </div>
      <form
        className="admin-filters"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...draft, q: draft.q?.trim() });
          setOffset(0);
        }}
      >
        <div className="admin-search">
          <Search size={16} aria-hidden="true" />
          <Input
            type="search"
            aria-label="Search users"
            placeholder="Search name or email…"
            maxLength={100}
            value={draft.q}
            onChange={(event) => setDraft({ ...draft, q: event.target.value })}
            disabled={busy}
          />
        </div>
        <FilterSelect
          label="Filter by role"
          value={draft.role || ""}
          onChange={(event) =>
            setDraft({ ...draft, role: (event.target.value as UserFilters["role"]) || undefined })
          }
          disabled={busy}
        >
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Administrators</option>
        </FilterSelect>
        <FilterSelect
          label="Filter by status"
          value={draft.status || ""}
          onChange={(event) =>
            setDraft({
              ...draft,
              status: (event.target.value as UserFilters["status"]) || undefined,
            })
          }
          disabled={busy}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </FilterSelect>
        <Button type="submit" variant="secondary" disabled={busy}>
          Apply filters
        </Button>
        {hasFilters && (
          <Button type="button" variant="ghost" disabled={busy} onClick={clear}>
            <X size={14} aria-hidden="true" /> Clear
          </Button>
        )}
      </form>
      <div className={selected ? "admin-users-layout has-detail" : "admin-users-layout"}>
        <div className="min-w-0">
          {users.isPending ? (
            <LoadingRows />
          ) : users.isError ? (
            <ReadError
              error={users.error}
              busy={users.isFetching}
              retry={() => void users.refetch()}
            />
          ) : (
            <>
              {users.data.users.length ? (
                <div
                  className="admin-table-wrap"
                  role="region"
                  aria-label="User accounts table"
                  tabIndex={0}
                >
                  <table className="admin-table">
                    <caption className="sr-only">Platform accounts, newest first</caption>
                    <thead>
                      <tr>
                        <th scope="col">Account</th>
                        <th scope="col">Role</th>
                        <th scope="col">Status</th>
                        <th scope="col">Databases</th>
                        <th scope="col">Joined</th>
                        <th scope="col">
                          <span className="sr-only">Details</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.data.users.map((user) => (
                        <tr
                          key={user.user_id}
                          className={selected === user.user_id ? "is-selected" : ""}
                        >
                          <td>
                            <strong className="admin-account-name">{user.username}</strong>
                            <span className="admin-secondary admin-email">{user.email}</span>
                          </td>
                          <td>{user.role === "admin" ? "Admin" : "User"}</td>
                          <td>
                            <span className={`admin-status is-${user.status}`}>
                              {user.status === "active" ? "Active" : "Suspended"}
                            </span>
                          </td>
                          <td>{user.database_count.toLocaleString()}</td>
                          <td className="admin-date">{timestamp(user.created_at)}</td>
                          <td>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={busy}
                              aria-label={`View account ${user.username}`}
                              aria-expanded={selected === user.user_id}
                              onClick={() => setParams({ user: user.user_id })}
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty">
                  <h3>
                    {offset > 0
                      ? "No accounts on this page"
                      : hasFilters
                        ? "No matching accounts"
                        : "No accounts yet"}
                  </h3>
                  <p>
                    {offset > 0
                      ? "The list may have changed. Return to the first page."
                      : "Try another search or adjust the filters."}
                  </p>
                </div>
              )}
              <PageControls
                page={users.data.pagination}
                count={users.data.users.length}
                busy={busy || users.isFetching}
                onPage={setOffset}
              />
            </>
          )}
        </div>
        {selected && (
          <AdminUserDetails
            key={selected}
            id={selected}
            onClose={() => setParams({})}
            onAccessError={onAccessError}
            onBusyChange={setBusy}
          />
        )}
      </div>
    </section>
  );
}
