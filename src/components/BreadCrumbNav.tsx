import { House, ChevronRight, Loader } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export default function BreadCrumbNav({
  db_name,
  table_name,
}: {
  db_name?: string;
  table_name?: string;
}) {
  const { user, isLoading } = useAuth();
  const { pathname } = useLocation();
  const pathSegments = pathname.split("/");

  const dashboardLink = user && user.userId ? `/dashboard/${user.userId}` : "/";

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
      <Link
        to="/"
        className="flex items-center text-gray-400 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors p-1 -ml-1 rounded-md"
        aria-label="Home"
      >
        <House className="h-3.5 w-3.5" />
      </Link>

      <ChevronRight className="h-3 w-3 text-gray-300 dark:text-zinc-600 shrink-0" />

      {isLoading ? (
        <Loader className="h-3 w-3 animate-spin text-purple-600" />
      ) : (
        <Link
          to={dashboardLink}
          className={`font-medium transition-colors ${
            pathSegments[1] === "dashboard" && !db_name
              ? "text-gray-900 dark:text-white font-semibold"
              : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          Projects
        </Link>
      )}

      {db_name && (
        <>
          <ChevronRight className="h-3 w-3 text-gray-300 dark:text-zinc-600 shrink-0" />
          <Link
            to={`/databases/${db_name}/tables`}
            className={`font-medium transition-colors ${
              pathSegments.length === 4 && !table_name
                ? "text-gray-900 dark:text-white font-semibold"
                : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {db_name}
          </Link>
        </>
      )}

      {table_name && db_name && (
        <>
          <ChevronRight className="h-3 w-3 text-gray-300 dark:text-zinc-600 shrink-0" />
          <span className="font-semibold text-gray-900 dark:text-white truncate">{table_name}</span>
        </>
      )}
    </nav>
  );
}
