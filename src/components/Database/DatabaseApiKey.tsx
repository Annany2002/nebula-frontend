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
import { toast } from "sonner";

interface DatabaseApiKeyProps {
  databaseName: string;
}

export function DatabaseApiKey({ databaseName }: DatabaseApiKeyProps) {
  const { token } = useRefetch();
  const [apiKey, setApiKey] = useState<string | "">("");
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch(
          `${url}/api/v1/account/databases/${databaseName}/apikey`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.key);
        }
      } catch (error) {
        console.error(
          `Failed to fetch API key for database ${databaseName}:`,
          error
        );
        toast.error(`Failed to fetch API key for database ${databaseName}`);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [databaseName, toast]);

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const response = await fetch(
        `${url}/api/v1/account/databases/${databaseName}/apikey`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.api_key);
        setShowKey(true);
        toast.success(
          `API key for database ${databaseName} generated successfully`
        );
      }
    } catch (error) {
      toast.error(`Failed to generate API key for database ${databaseName}`);
    } finally {
      setGenerating(false);
    }
  };

  const toggleShowKey = () => {
    setShowKey(!showKey);
  };

  const copyToClipboard = (text: string) => {
    window.navigator.clipboard.writeText(text);
    toast.success("API key copied successfully");
  };

  return (
    <Card className="w-full">
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
                  disabled={loading || apiKey === ""}
                  type={`${showKey ? "text" : "password"}`}
                  className="pr-10 font-mono text-sm"
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
                  onClick={() => copyToClipboard(apiKey)}
                  disabled={loading}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {apiKey === "" && (
          <Button
            onClick={handleGenerateKey}
            disabled={generating}
            className="w-full sm:w-auto"
            size="sm"
          >
            {generating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Generate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
