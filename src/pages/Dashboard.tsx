import CreateDatabase from "@/components/Database/CreateDatabase";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DatabaseIcon, LoaderCircle, RefreshCcw } from "lucide-react";
import { useRefetch } from "@/hooks/use-refetch";
import { EmptyState } from "@/components/ui/empty-state";
import LoginNavBar from "@/components/LoginNavbar";
import { DatabaseCard } from "@/components/Database/DatabaseCard";
import BreadCrumbNav from "@/components/BreadCrumbNav";

const Dashboard = () => {
  const { databases, refetchDb, dbLoading } = useRefetch();
  const [openChange, setOpenChange] = useState(false);

  useEffect(() => {
    refetchDb();
  }, [openChange]);

  return (
    <div className="min-h-screen space-y-6">
      <LoginNavBar />
      <div className="px-3">
        <BreadCrumbNav />
      </div>
      <div className="px-4 flex justify-between">
        <div className="flex flex-col gap-1 justify-center">
          <span className="text-xl md:text-3xl text-primary font-semibold">
            Your Projects
          </span>
          <p className="text-muted-foreground text-sm">
            View and Manage all your projects.
          </p>
        </div>
        <div className="flex gap-6 items-center">
          <RefreshCcw
            size={20}
            onClick={() => refetchDb()}
            className={`cursor-pointer ${dbLoading && "animate-spin"}`}
          />
          <CreateDatabase
            openChange={openChange}
            setOpenChange={setOpenChange}
          />
        </div>
      </div>

      {(!databases || databases.length === 0) && (
        <div className="my-12">
          <NoProjects setOpenChange={setOpenChange} />
        </div>
      )}

      <div className="w-full px-2 mt-6">
        {dbLoading ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          databases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-2">
              {databases.map((database, index) => (
                <div key={index}>
                  <DatabaseCard database={database} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

function NoProjects({
  setOpenChange,
}: {
  setOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <EmptyState
      icon={DatabaseIcon}
      title="No databases yet"
      description="Create your first database to get started."
      actionLabel="Create Database"
      actionOnClick={() => setOpenChange(true)}
      className="mx-auto max-w-md mt-16"
    />
  );
}

export default Dashboard;
