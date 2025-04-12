import { House } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function BreadCrumbNav({
  db_name,
  table_name,
}: {
  db_name?: string;
  table_name?: string;
}) {
  const { user } = useAuth();
  const { pathname } = useLocation();

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
          <Link
            to={`/dashboard/${user.userId}`}
            className={`${
              pathname.split("/")[1] === "dashboard" && "text-purple-500"
            }`}
          >
            Projects
          </Link>
        </BreadcrumbItem>
        {db_name && (
          <>
            <BreadcrumbSeparator />
            <Link
              to={`/databases/${db_name}/tables`}
              className={`${
                pathname.split("/").length === 4 && "text-purple-500"
              }`}
            >
              {db_name}
            </Link>
          </>
        )}
        {table_name && (
          <>
            <BreadcrumbSeparator />
            <Link
              to={`/databases/${db_name}/tables/${table_name}`}
              className="text-purple-500"
            >
              {table_name}
            </Link>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
