import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Check, Trash2, RotateCw } from "lucide-react";
import { useApiKey, useGenerateApiKey, useDeleteApiKey } from "@/hooks/queries";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DatabaseApiKeyProps {
  databaseName?: string;
}

export function DatabaseApiKey({ databaseName = "" }: DatabaseApiKeyProps) {
  const { data: fetchedKey = "", isLoading } = useApiKey(databaseName);
  const { mutate: generateKey, isPending: generating } = useGenerateApiKey();
  const { mutate: deleteKey, isPending: deleting } = useDeleteApiKey();

  const [localKey, setLocalKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use local key override if set by mutation, otherwise query data
  const apiKey = localKey !== null ? localKey : fetchedKey;

  const handleGenerateKey = () => {
    if (!databaseName) return;
    generateKey(databaseName, {
      onSuccess: (data: { api_key?: string }) => {
        if (data?.api_key) {
          setLocalKey(data.api_key);
        }
      },
    });
  };

  const handleDeleteKey = () => {
    if (!databaseName) return;
    deleteKey(databaseName, {
      onSuccess: () => {
        setLocalKey("");
      },
    });
  };

  const copyToClipboard = (text: string) => {
    window.navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}${"•".repeat(16)}${apiKey.slice(-6)}` : "";

  return (
    <div className="rounded-2xl border border-purple-200/50 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl p-4 sm:p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Info Column */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">API Key</h3>
            <span
              className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded-full font-medium",
                apiKey
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {apiKey ? "Active" : "None"}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Authenticate requests to project{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted/60 dark:bg-white/10 font-mono text-[11px] text-foreground">
              {databaseName}
            </code>{" "}
            via the SDK or REST API.
          </p>
        </div>

        {/* Action Column */}
        <div className="flex items-center gap-2 shrink-0">
          {apiKey ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-purple-200/50 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-md">
                <code className="font-mono text-xs text-gray-700 dark:text-zinc-300 truncate max-w-[200px] sm:max-w-[280px]">
                  {showKey ? apiKey : maskedKey}
                </code>
                <div className="flex items-center gap-1 shrink-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{showKey ? "Hide key" : "Show key"}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
                          onClick={() => copyToClipboard(apiKey)}
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{copied ? "Copied!" : "Copy key"}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleDeleteKey}
                      disabled={deleting}
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-xl border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-300 shrink-0"
                    >
                      {deleting ? (
                        <RotateCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Revoke API Key</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <Button
              onClick={handleGenerateKey}
              disabled={generating || isLoading}
              size="sm"
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-sm"
            >
              {generating ? (
                <span className="flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </span>
              ) : (
                "Generate Key"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
