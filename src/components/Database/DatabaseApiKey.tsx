import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Key, RefreshCw, Copy } from "lucide-react";
import { url } from "@/App";
import { useRefetch } from "@/hooks/use-refetch";
import { useApiKey, useGenerateApiKey, useDeleteApiKey } from "@/hooks/queries";
import { toast } from "sonner";

interface DatabaseApiKeyProps {
  databaseName: string;
}

export function DatabaseApiKey({ databaseName }: DatabaseApiKeyProps) {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { data: apiKey = "", isLoading } = useApiKey(databaseName);
  const { mutate: generateKey, isPending: generating } = useGenerateApiKey();
  const { mutate: deleteKey } = useDeleteApiKey();
  
  const [showKey, setShowKey] = useState(false);

  const handleGenerateKey = () => generateKey(databaseName);
  const deleteAPIKey = () => deleteKey(databaseName);

  const toggleShowKey = () => {
    setShowKey(!showKey);
  };

  const copyToClipboard = (text: string) => {
    window.navigator.clipboard.writeText(text);
    toast.success("API key copied successfully");
  };

  return (
    <Card className="w-full bg-transparent backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Key className="h-4 w-4" />
          Database API Key
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-primary">
              Use this key with SDK to access project{" "}
              <span className="text-primary font-medium">{databaseName}</span>
            </p>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  value={apiKey}
                  readOnly
                  disabled={isLoading || apiKey === ""}
                  type={`${showKey ? "text" : "password"}`}
                  className="pr-10 font-mono text-sm bg-transparent"
                />
                {apiKey && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={toggleShowKey}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              {apiKey && (
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-transparent"
                  onClick={() => copyToClipboard(apiKey)}
                  disabled={isLoading}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {apiKey === "" ? (
          <Button
            onClick={handleGenerateKey}
            disabled={generating}
            className="w-full sm:w-auto"
            size="sm"
          >
            {generating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Generate
          </Button>
        ) : (
          <Button onClick={deleteAPIKey} size="sm" variant="destructive">
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
