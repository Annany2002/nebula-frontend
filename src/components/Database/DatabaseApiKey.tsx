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
import { useToast } from "@/hooks/use-toast";

interface DatabaseApiKeyProps {
  databaseName: string;
}

export function DatabaseApiKey({ databaseName }: DatabaseApiKeyProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = "";
        setApiKey(key);
      } catch (error) {
        console.error(
          `Failed to fetch API key for database ${databaseName}:`,
          error
        );
        toast({
          title: "Error",
          description: `Failed to fetch API key for database ${databaseName}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [databaseName, toast]);

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const newKey = "";
      setApiKey(newKey);
      setShowKey(true);
      toast({
        title: "Success",
        description: `API key for database ${databaseName} generated successfully`,
      });
    } catch (error) {
      console.error(
        `Failed to generate API key for database ${databaseName}:`,
        error
      );
      toast({
        title: "Error",
        description: `Failed to generate API key for database ${databaseName}`,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const toggleShowKey = () => {
    setShowKey(!showKey);
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast({
        title: "Copied",
        description: `API key for database ${databaseName} copied to clipboard`,
      });
    }
  };

  const displayKey = apiKey
    ? showKey
      ? apiKey
      : apiKey.replace(/./g, "•")
    : "No API key generated";

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
            <p className="text-sm font-medium">
              Use this key with SDK to access {databaseName}
            </p>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  value={displayKey}
                  readOnly
                  disabled={loading || !apiKey}
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
                  onClick={copyToClipboard}
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
        <Button
          onClick={handleGenerateKey}
          disabled={generating}
          className="w-full sm:w-auto"
          size="sm"
        >
          {generating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {apiKey ? "Regenerate Key" : "Generate Key"}
        </Button>
      </CardFooter>
    </Card>
  );
}
