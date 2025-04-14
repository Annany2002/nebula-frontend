import { House } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Loader } from "lucide-react";

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

  // Check if user and user.userId are defined before using them
  const dashboardLink = user && user.userId ? `/dashboard/${user.userId}` : "/"; // Default to home if user or userId is undefined

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link to="/">
            <House size={18} />
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {isLoading ? (
            <Loader className="animate-spin" size={18} />
          ) : (
            <Link
              to={dashboardLink}
              className={`${
                pathSegments[1] === "dashboard" && "text-purple-500"
              }`}
            >
              Projects
            </Link>
          )}
        </BreadcrumbItem>
        {db_name && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link
                to={`/databases/${db_name}/tables`}
                className={`${pathSegments.length === 4 && "text-purple-500"}`}
              >
                {db_name}
              </Link>
            </BreadcrumbItem>
          </>
        )}
        {table_name && db_name && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link
                to={`/databases/${db_name}/tables/${table_name}`}
                className="text-purple-500"
              >
                {table_name}
              </Link>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
