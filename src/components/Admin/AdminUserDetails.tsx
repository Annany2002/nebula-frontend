import { formatDateTime as timestamp } from "@/lib/formatDate";
import { useCallback, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useAdminRead } from "@/hooks/useManagement";
import { getAdminUser, isAccessError, ManagementError, setAdminUserStatus } from "@/lib/management";
import { Button } from "@/components/ui/button";
import { AccessFailure, LoadingRows, ReadError } from "./AdminShared";

export default function AdminUserDetails({
  id,
  onClose,
  onAccessError,
  onBusyChange,
}: {
  id: string;
  onClose: () => void;
  onAccessError: AccessFailure;
  onBusyChange: (busy: boolean) => void;
}) {
  const { user: actor } = useAuth();
  const client = useQueryClient();
  const account = useAdminRead(["user", id], (signal) => getAdminUser(id, signal), onAccessError);
  const [desiredStatus, setDesiredStatus] = useState<"active" | "suspended" | null>(null);
  const focusHeading = useCallback((node: HTMLHeadingElement | null) => node?.focus(), []);
  const actionRef = useRef<HTMLButtonElement>(null);
  const mutation = useMutation({
    mutationFn: (status: "active" | "suspended") => setAdminUserStatus(id, status),
    retry: false,
    gcTime: 0,
    onSuccess: (updated) => {
      setDesiredStatus(null);
      toast.success(
        updated.status === "suspended"
          ? "Account suspended. Previous JWT sessions are revoked."
          : "Account activated. A fresh sign-in is required."
      );
      requestAnimationFrame(() => actionRef.current?.focus());
    },
    onError: (error) => {
      if (isAccessError(error)) onAccessError(error as ManagementError);
    },
    onSettled: () => {
      onBusyChange(false);
      // Refetch authoritative state even after a failed or uncertain write. Never toggle optimistically.
      for (const key of ["users", "user", "audit"])
        void client.invalidateQueries({ queryKey: ["administration", actor?.userId, key] });
    },
  });
  const unknown = mutation.error instanceof ManagementError && mutation.error.outcomeUnknown;
  const reload = async () => {
    const result = await account.refetch();
    if (!result.isError) {
      mutation.reset();
      setDesiredStatus(null);
    }
  };
  const data = account.isError ? undefined : account.data;
  return (
    <aside
      className="admin-detail"
      aria-labelledby="account-detail-heading"
      aria-busy={account.isFetching || mutation.isPending}
    >
      <div className="admin-section-heading">
        <h2 id="account-detail-heading" tabIndex={-1} ref={focusHeading}>
          Account details
        </h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close account details"
          disabled={mutation.isPending}
          onClick={onClose}
        >
          <X size={16} aria-hidden="true" />
        </Button>
      </div>
      {account.isPending ? (
        <LoadingRows />
      ) : account.isError ? (
        <ReadError error={account.error} busy={account.isFetching} retry={() => void reload()} />
      ) : (
        data && (
          <>
            <h3>{data.username}</h3>
            <p className="admin-email">{data.email}</p>
            <dl>
              <div>
                <dt>Account ID</dt>
                <dd className="font-mono break-all">{data.user_id}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>{data.role === "admin" ? "Administrator" : "User"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd className={`admin-status is-${data.status}`}>
                  {data.status === "active" ? "Active" : "Suspended"}
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  {data.email_verified
                    ? "Verified"
                    : data.verification_required
                      ? "Verification required"
                      : "Unverified, verification not required"}
                </dd>
              </div>
              <div>
                <dt>Databases</dt>
                <dd>{data.database_count.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Joined</dt>
                <dd>{timestamp(data.created_at)}</dd>
              </div>
            </dl>
            <Link
              className="admin-text-link"
              to={`/admin/audit?target_user_id=${encodeURIComponent(id)}`}
            >
              View access history
            </Link>
            <div className="admin-account-action">
              {data.role === "admin" ? (
                <p>
                  Administrator accounts are protected. A server operator must revoke membership
                  through the CLI before suspension.
                </p>
              ) : (
                <>
                  {mutation.error && (
                    <p role="alert" className="admin-action-error">
                      {mutation.error.message}
                    </p>
                  )}
                  {unknown ? (
                    <Button
                      variant="outline"
                      disabled={account.isFetching}
                      onClick={() => void reload()}
                    >
                      Reload account status
                    </Button>
                  ) : desiredStatus ? (
                    <div className="admin-confirm" role="group" aria-label="Confirm access change">
                      <h4>
                        {desiredStatus === "suspended"
                          ? "Suspend this account?"
                          : "Activate this account?"}
                      </h4>
                      <p>
                        {desiredStatus === "suspended"
                          ? "This blocks login and protected API access, revokes existing JWT sessions, and preserves databases and API keys."
                          : "The user must sign in again. Existing API keys resume access, subject to email verification and their original scope."}
                      </p>
                      <div>
                        <Button
                          variant={desiredStatus === "suspended" ? "destructive" : "default"}
                          disabled={mutation.isPending || account.isFetching}
                          onClick={() => {
                            onBusyChange(true);
                            mutation.mutate(desiredStatus);
                          }}
                        >
                          {mutation.isPending
                            ? "Saving…"
                            : desiredStatus === "suspended"
                              ? "Confirm suspension"
                              : "Confirm activation"}
                        </Button>
                        <Button
                          variant="outline"
                          autoFocus
                          disabled={mutation.isPending}
                          onClick={() => {
                            setDesiredStatus(null);
                            requestAnimationFrame(() => actionRef.current?.focus());
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      ref={actionRef}
                      variant={data.status === "active" ? "destructive" : "outline"}
                      disabled={account.isFetching || mutation.isPending}
                      onClick={() => {
                        mutation.reset();
                        setDesiredStatus(data.status === "active" ? "suspended" : "active");
                      }}
                    >
                      {data.status === "active" ? "Suspend account" : "Activate account"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </>
        )
      )}
    </aside>
  );
}
