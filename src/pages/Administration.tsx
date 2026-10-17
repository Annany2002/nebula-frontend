import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AccountError, getAccountProfile } from "@/lib/account";
import { ManagementError } from "@/lib/management";
import LoginNavBar from "@/components/LoginNavbar";
import { Button } from "@/components/ui/button";
import { LoadingRows, ReadError } from "@/components/Admin/AdminShared";
import PlatformStats from "@/components/Admin/PlatformStats";
import AdminUsers from "@/components/Admin/AdminUsers";
import AdminAudit from "@/components/Admin/AdminAudit";
import "@/styles/dashboard.css";
import "@/styles/administration.css";

export default function Administration() {
  const { user } = useAuth();
  const profile = useQuery({
    queryKey: ["adminAccess", user?.userId],
    queryFn: ({ signal }) => getAccountProfile(localStorage.getItem("token"), signal),
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
  return (
    <div className="nebula-dashboard min-h-screen bg-background text-foreground">
      <LoginNavBar />
      <main className="db-dashboard-main admin-main">
        <header className="db-page-header">
          <div>
            <p className="db-workspace-label">
              <ShieldCheck size={14} aria-hidden="true" /> Platform administration
            </p>
            <h1>Administration</h1>
            <p className="db-page-description">
              Manage account access and review platform activity.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to={`/dashboard/${user?.userId}`}>
              <ArrowLeft size={15} aria-hidden="true" /> Projects
            </Link>
          </Button>
        </header>
        {profile.isPending ? (
          <LoadingRows />
        ) : profile.isError ? (
          profile.error instanceof AccountError &&
          [401, 403, 404].includes(profile.error.status) ? (
            <AccessNotice message={profile.error.message} />
          ) : (
            <ReadError
              error={profile.error}
              busy={profile.isFetching}
              retry={() => void profile.refetch()}
            />
          )
        ) : profile.data.role !== "admin" ? (
          <AccessNotice
            message={
              profile.data.role
                ? "This area requires platform administrator access."
                : "This server hasn’t provided an administrator role. Update the backend before using this area."
            }
          />
        ) : (
          <AdminWorkspace />
        )}
      </main>
    </div>
  );
}

function AccessNotice({ message }: { message: string }) {
  const { clearSession } = useAuth();
  return (
    <section className="admin-access" role="alert">
      <ShieldCheck size={26} aria-hidden="true" />
      <h2>Access unavailable</h2>
      <p>{message}</p>
      <p>Administrator membership is managed by a trusted server operator.</p>
      <Button variant="outline" asChild>
        <Link to="/sign-in" onClick={clearSession}>
          Sign in with another account
        </Link>
      </Button>
    </section>
  );
}

function AdminWorkspace() {
  const [accessError, setAccessError] = useState<ManagementError | null>(null);
  if (accessError) return <AccessNotice message={accessError.message} />;
  return (
    <>
      <PlatformStats onAccessError={setAccessError} />
      <nav className="admin-tabs" aria-label="Administration">
        <NavLink to="/admin/users">Users</NavLink>
        <NavLink to="/admin/audit">Audit history</NavLink>
      </nav>
      <Routes>
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<AdminUsers onAccessError={setAccessError} />} />
        <Route path="audit" element={<AdminAudit onAccessError={setAccessError} />} />
        <Route path="*" element={<Navigate to="/admin/users" replace />} />
      </Routes>
    </>
  );
}
