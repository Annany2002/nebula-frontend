import { useState, useEffect } from "react";
// import { getApiKey, generateApiKey } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Key, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ApiKeyManager() {
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
        console.error("Failed to fetch API key:", error);
        toast({
          title: "Error",
          description: "Failed to fetch API key",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [toast]);

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const newKey = "";
      setApiKey(newKey);
      setShowKey(true);
      toast({
        title: "Success",
        description: "API key generated successfully",
      });
    } catch (error) {
      console.error("Failed to generate API key:", error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
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
        description: "API key copied to clipboard",
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
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>
          Use API keys to authenticate your API requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Your API Key</p>
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
                  onClick={copyToClipboard}
                  disabled={loading}
                >
                  Copy
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
        >
          {generating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {apiKey ? "Regenerate API Key" : "Generate API Key"}
        </Button>
      </CardFooter>
    </Card>
  );
}
