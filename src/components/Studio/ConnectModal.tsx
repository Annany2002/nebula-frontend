import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, Copy, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useApiKey } from "@/hooks/queries";
import { connectionExamples, ConnectionExampleId, databaseApiUrl } from "@/lib/connectionExamples";
import "@/styles/connection-dialog.css";

interface ConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dbName: string;
  returnFocusTo: HTMLElement | null;
}
export default function ConnectModal({
  open,
  onOpenChange,
  dbName,
  returnFocusTo,
}: ConnectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent
          className="connection-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = returnFocusTo?.isConnected
              ? returnFocusTo
              : document.querySelector<HTMLElement>(".studio-connect-button");
            target?.focus();
          }}
        >
          <ConnectionPanel key={dbName} dbName={dbName} onClose={() => onOpenChange(false)} />
        </DialogContent>
      )}
    </Dialog>
  );
}

function ConnectionPanel({ dbName, onClose }: { dbName: string; onClose: () => void }) {
  const query = useApiKey(dbName);
  const navigate = useNavigate();
  const urlLabel = useId();
  const baseUrl = databaseApiUrl(dbName);
  const examples = connectionExamples(dbName);
  const [example, setExample] = useState<ConnectionExampleId>("curl");
  const [copied, setCopied] = useState<{ target: string; value: string } | null>(null);
  const [copyError, setCopyError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const mounted = useRef(true);
  const operation = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  const copy = async (text: string, target: string) => {
    const current = ++operation.current;
    setCopyError("");
    try {
      await navigator.clipboard.writeText(text);
      if (!mounted.current || current !== operation.current) return;
      setCopied({ target, value: text });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      if (mounted.current && current === operation.current)
        setCopyError("Couldn’t copy. Select the text and copy it manually, or try again.");
    }
  };
  const wasCopied = (target: string, text: string) =>
    copied?.target === target && copied.value === text;
  const manageKeys = () => {
    onClose();
    navigate(`/databases/${encodeURIComponent(dbName)}/apikeys`);
  };
  return (
    <>
      <DialogHeader className="connection-heading">
        <DialogTitle>
          Connect to <span title={dbName}>{dbName}</span>
        </DialogTitle>
        <DialogDescription>Use your saved API key from a server or command line.</DialogDescription>
      </DialogHeader>
      <div className="connection-body">
        <section className="connection-endpoint" aria-labelledby={urlLabel}>
          <h2 id={urlLabel}>Database API URL</h2>
          <div>
            <code tabIndex={0} aria-labelledby={urlLabel}>
              {baseUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copy(baseUrl, "url")}
              aria-label={wasCopied("url", baseUrl) ? "API URL copied" : "Copy API URL"}
            >
              {wasCopied("url", baseUrl) ? <Check size={15} /> : <Copy size={15} />}
            </Button>
          </div>
        </section>
        <section className="connection-key" aria-label="API key status">
          <div>
            <h2>API key</h2>
            {query.isPending ? (
              <p role="status">Loading key details…</p>
            ) : query.isError ? (
              <div role="alert" className="connection-key-error">
                <span>Key status couldn’t be loaded.</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => query.refetch()}
                  disabled={query.isFetching}
                >
                  <RefreshCw
                    size={12}
                    className={query.isFetching ? "animate-spin motion-reduce:animate-none" : ""}
                  />
                  Retry
                </Button>
              </div>
            ) : query.data ? (
              <>
                <p className="connection-key-prefix">
                  Active key <code>{query.data.key_prefix}</code>
                </p>
                <p>Use the secret you saved when this key was created.</p>
              </>
            ) : (
              <p>No API key yet. Create one in API keys to connect your app.</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={manageKeys}>
            Manage API keys <ArrowUpRight size={13} />
          </Button>
        </section>
        <section className="connection-examples" aria-label="Connection examples">
          <div className="connection-examples-heading">
            <h2>List your tables</h2>
            <p>
              Set <code>NEBULA_API_KEY</code> to your saved secret in your server’s environment.
            </p>
          </div>
          <Tabs
            value={example}
            onValueChange={(value) => {
              setExample(value as ConnectionExampleId);
              operation.current++;
              setCopied(null);
              setCopyError("");
              clearTimeout(timer.current);
            }}
          >
            <TabsList className="connection-tabs" aria-label="Connection language">
              {examples.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {examples.map((item) => (
              <TabsContent key={item.id} value={item.id} className="connection-example">
                <div className="connection-example-toolbar">
                  <p>{item.hint}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copy(item.code, item.id)}
                    aria-label={
                      wasCopied(item.id, item.code)
                        ? `${item.label} example copied`
                        : `Copy ${item.label} example`
                    }
                  >
                    {wasCopied(item.id, item.code) ? <Check size={14} /> : <Copy size={14} />}
                    {wasCopied(item.id, item.code) ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre tabIndex={0} aria-label={`${item.label} connection example`}>
                  <code>{item.code}</code>
                </pre>
              </TabsContent>
            ))}
          </Tabs>
        </section>
        {copyError && (
          <p role="alert" className="connection-copy-error">
            {copyError}
          </p>
        )}
        <span role="status" className="sr-only">
          {copied ? "Copied to clipboard." : ""}
        </span>
      </div>
    </>
  );
}
