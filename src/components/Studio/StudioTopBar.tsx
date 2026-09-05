import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronDown,
  Database,
  Globe,
  Plus,
  Check,
  Search,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDatabases } from "@/hooks/queries";
import UserDropDown from "@/components/UserDropDown";
import ConnectModal from "./ConnectModal";
import { StudioTab } from "./StudioRail";
import NebulaLogo from "@/assets/nebula-logo";

interface StudioTopBarProps {
  dbName: string;
  currentTab?: StudioTab;
  apiKey: string;
  userId?: string;
}

export default function StudioTopBar({ dbName, apiKey, userId }: StudioTopBarProps) {
  const navigate = useNavigate();
  const { data: databases = [] } = useDatabases();
  const [connectOpen, setConnectOpen] = useState(false);

  const resolvedUserId = userId || localStorage.getItem("user_id") || "";

  const handleSelectDB = (targetDB: string) => {
    if (targetDB === dbName) return;
    navigate(`/databases/${targetDB}/overview`);
  };

  return (
    <>
      <header className="h-12 bg-white/80 dark:bg-[#0c0b16]/85 backdrop-blur-xl border-b border-purple-200/50 dark:border-white/10 px-4 flex items-center justify-between z-20 flex-shrink-0">
        {/* Left: Breadcrumbs & Database Switcher */}
        <div className="flex items-center space-x-2.5 text-xs">
          {/* Logo & Projects Navigation */}
          <Link
            to={resolvedUserId ? `/dashboard/${resolvedUserId}` : "/"}
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Projects
          </Link>

          <span className="text-muted-foreground/40 font-light">/</span>

          {/* Database Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 dark:bg-white/5 border border-purple-200/50 dark:border-white/10 hover:bg-purple-500/15 dark:hover:bg-white/10 transition-colors font-semibold text-foreground focus:outline-none shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-purple-700 dark:text-purple-300">{dbName}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 bg-popover/95 backdrop-blur-xl border-purple-200/50 dark:border-white/10 text-popover-foreground p-1 shadow-xl shadow-purple-950/20"
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
                Switch Database
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              {databases.map((db) => {
                const isSelected = db.dbName === dbName;
                return (
                  <DropdownMenuItem
                    key={db.databaseId}
                    onClick={() => handleSelectDB(db.dbName)}
                    className="flex items-center justify-between text-xs px-2 py-1.5 rounded cursor-pointer hover:bg-purple-500/10 focus:bg-purple-500/10"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Database className="w-3.5 h-3.5 text-purple-500" />
                      <span className="truncate font-medium">{db.dbName}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    )}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="bg-border" />
              {resolvedUserId && (
                <DropdownMenuItem
                  onClick={() => navigate(`/dashboard/${resolvedUserId}`)}
                  className="flex items-center space-x-2 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Database</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Connect Button */}
          <Button
            size="sm"
            onClick={() => setConnectOpen(true)}
            className="h-7 px-2.5 text-[11px] bg-white/10 dark:bg-white/5 border border-purple-200/40 dark:border-white/10 hover:bg-purple-500/15 text-foreground font-medium gap-1.5 shadow-xs transition-colors"
          >
            <Globe className="w-3 h-3 text-purple-500" />
            <span>Connect</span>
          </Button>
        </div>

        {/* Right Section: Docs + User Profile */}
        <div className="flex items-center space-x-2.5">
          <a
            href="https://github.com/Annany2002/nebula"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-purple-500/10"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Docs</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <div className="pl-1 border-l border-purple-200/40 dark:border-white/10">
            <UserDropDown />
          </div>
        </div>
      </header>

      {/* Connect Modal */}
      <ConnectModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        dbName={dbName}
        apiKey={apiKey}
      />
    </>
  );
}
