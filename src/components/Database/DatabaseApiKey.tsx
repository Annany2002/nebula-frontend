import { useEffect, useId, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RotateCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiKey, useGenerateApiKey, useDeleteApiKey } from "@/hooks/queries";
import { apiKeyPrefix } from "@/lib/apiKey";
import { formatDateTime } from "@/lib/formatDate";
import "@/styles/api-keys.css";

interface DatabaseApiKeyProps {
  databaseName?: string;
}
export function DatabaseApiKey({ databaseName = "" }: DatabaseApiKeyProps) {
  return <KeyManager key={databaseName} databaseName={databaseName} />;
}
function KeyManager({ databaseName }: DatabaseApiKeyProps) {
  const id = useId();
  const {
    data: metadata,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useApiKey(databaseName || "");
  const generate = useGenerateApiKey();
  const revoke = useDeleteApiKey();
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState("");
  const [copyError, setCopyError] = useState("");
  const [confirmation, setConfirmation] = useState<"rotate" | "revoke" | null>(null);
  const [confirmationPrefix, setConfirmationPrefix] = useState("");
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const mounted = useRef(true);
  const rotateButton = useRef<HTMLButtonElement>(null);
  const revokeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(copyTimer.current);
    };
  }, []);
  const busy = generate.isPending || revoke.isPending;
  const canChange = !!databaseName && metadata !== undefined && !isError && !isFetching && !busy;
  const activeConfirmation = metadata?.key_prefix === confirmationPrefix ? confirmation : null;
  const freshKey = secret && metadata?.key_prefix === apiKeyPrefix(secret) ? secret : "";
  const createdAt = formatDateTime(metadata?.created_at);
  const clearSecret = () => {
    setSecret("");
    setShowSecret(false);
    setCopiedSecret("");
    setCopyError("");
    clearTimeout(copyTimer.current);
    generate.reset();
  };
  const create = () => {
    if (!canChange || (metadata && activeConfirmation !== "rotate")) return;
    setCopyError("");
    setCopiedSecret("");
    generate.reset();
    generate.mutate(databaseName || "", {
      onSuccess: (data) => {
        setSecret(data.api_key);
        setShowSecret(false);
        setConfirmation(null);
        generate.reset();
      },
    });
  };
  const remove = () => {
    if (!canChange || !metadata || activeConfirmation !== "revoke") return;
    revoke.mutate(databaseName || "", {
      onSuccess: () => {
        clearSecret();
        setConfirmation(null);
      },
    });
  };
  const confirm = (action: "rotate" | "revoke") => {
    generate.reset();
    revoke.reset();
    setConfirmationPrefix(metadata?.key_prefix || "");
    setConfirmation(action);
  };
  const cancel = () => {
    const trigger = activeConfirmation === "rotate" ? rotateButton.current : revokeButton.current;
    setConfirmation(null);
    generate.reset();
    revoke.reset();
    requestAnimationFrame(() => {
      if (mounted.current) trigger?.focus();
    });
  };
  const copy = async () => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(freshKey);
      if (!mounted.current) return;
      setCopiedSecret(freshKey);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedSecret(""), 2000);
    } catch {
      if (mounted.current)
        setCopyError("Couldn’t copy. Select and copy the revealed key, or try again.");
    }
  };
  return (
    <section className="api-key-manager" aria-labelledby={`${id}-title`}>
      <header className="api-key-section-heading">
        <div>
          <KeyRound size={17} />
          <h2 id={`${id}-title`}>Database key</h2>
        </div>
        {!isLoading && !isError && metadata !== undefined && (
          <span className={metadata ? "api-key-state is-configured" : "api-key-state"}>
            {metadata ? "Configured" : "No key"}
          </span>
        )}
      </header>
      {isLoading ? (
        <div className="api-key-loading" role="status" aria-label="Loading API key details">
          <span className="animate-pulse motion-reduce:animate-none" />
          <span className="animate-pulse motion-reduce:animate-none" />
          <span className="sr-only">Loading API key details</span>
        </div>
      ) : !databaseName ? (
        <p className="api-key-error" role="alert">
          Choose a database to manage its key.
        </p>
      ) : isError && !metadata ? (
        <div className="api-key-load-error" role="alert">
          <AlertCircle size={20} />
          <h3>Key details couldn’t be loaded.</h3>
          <p>{error.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            Retry
          </Button>
        </div>
      ) : metadata ? (
        <>
          {isError && (
            <div className="api-key-refresh-error" role="alert">
              <p>Key details couldn’t be refreshed. Showing the last loaded details.</p>
              <Button variant="outline" size="sm" disabled={isFetching} onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}
          <dl className="api-key-details">
            <div>
              <dt>Key prefix</dt>
              <dd>
                <code>{metadata.key_prefix}</code>
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>
                {createdAt ? (
                  <time dateTime={metadata.created_at}>{createdAt}</time>
                ) : (
                  "Date unavailable"
                )}
              </dd>
            </div>
          </dl>
          <p className="api-key-description">
            The full secret is only returned when a key is generated. Use your saved key to
            authenticate requests.
          </p>
          <div className="api-key-actions">
            <Button
              ref={rotateButton}
              variant="outline"
              size="sm"
              onClick={() => confirm("rotate")}
              disabled={!canChange || !!activeConfirmation}
            >
              <RotateCw size={14} />
              Rotate key
            </Button>
            <Button
              ref={revokeButton}
              variant="ghost"
              size="sm"
              className="api-key-revoke"
              onClick={() => confirm("revoke")}
              disabled={!canChange || !!activeConfirmation}
            >
              <Trash2 size={14} />
              Revoke key
            </Button>
          </div>
        </>
      ) : (
        <div className="api-key-empty">
          <h3>No API key for this database.</h3>
          <p>
            Generate a key to connect your app to <code>{databaseName}</code>.
          </p>
          <Button size="sm" onClick={create} disabled={!canChange}>
            {generate.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
                Generating…
              </>
            ) : (
              <>
                <KeyRound size={14} />
                Generate key
              </>
            )}
          </Button>
        </div>
      )}
      {!activeConfirmation && generate.isError && (
        <p className="api-key-error" role="alert">
          {generate.error.message}
        </p>
      )}
      {activeConfirmation && (
        <section className="api-key-confirmation" aria-labelledby={`${id}-confirm`}>
          <h3 id={`${id}-confirm`}>
            {activeConfirmation === "rotate" ? "Rotate" : "Revoke"} key for {databaseName}?
          </h3>
          <p>
            {activeConfirmation === "rotate"
              ? "The current key will stop working immediately. Copy the replacement and update every app using this database."
              : "Apps using this key will lose access immediately. Your database and its records will remain available in Studio."}
          </p>
          {(generate.isError || revoke.isError) && (
            <p className="api-key-error" role="alert">
              {generate.error?.message || revoke.error?.message}
            </p>
          )}
          <div>
            <Button variant="outline" size="sm" onClick={cancel} disabled={busy} autoFocus>
              Cancel
            </Button>
            <Button
              size="sm"
              className={
                activeConfirmation === "revoke"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
              disabled={!canChange}
              onClick={activeConfirmation === "rotate" ? create : remove}
            >
              {busy ? (
                <>
                  <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
                  {activeConfirmation === "rotate" ? "Rotating…" : "Revoking…"}
                </>
              ) : activeConfirmation === "rotate" ? (
                "Rotate and generate key"
              ) : (
                "Revoke this key"
              )}
            </Button>
          </div>
        </section>
      )}
      {freshKey && (
        <section className="api-key-secret" aria-labelledby={`${id}-secret`}>
          <h3 id={`${id}-secret`}>Copy your new key</h3>
          <p>Save this secret now. It won’t be available after you leave this page.</p>
          <div className="api-key-secret-value">
            <code aria-label="New API key">
              {showSecret ? freshKey : "••••••••••••••••••••••••••••••••"}
            </code>
            <Button
              variant="ghost"
              size="icon"
              aria-label={showSecret ? "Hide new key" : "Show new key"}
              aria-pressed={showSecret}
              disabled={busy}
              onClick={() => setShowSecret((previous) => !previous)}
            >
              {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
            </Button>
          </div>
          <div className="api-key-secret-actions">
            <Button size="sm" disabled={busy} onClick={copy} autoFocus>
              {copiedSecret === freshKey ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedSecret === freshKey ? "Key copied" : "Copy new key"}</span>
            </Button>
            <Button variant="ghost" size="sm" disabled={busy} onClick={clearSecret}>
              I’ve saved this key
            </Button>
          </div>
          {copyError && (
            <p className="api-key-error" role="alert">
              {copyError}
            </p>
          )}
          <span className="sr-only" role="status">
            {copiedSecret === freshKey ? "API key copied to clipboard" : ""}
          </span>
        </section>
      )}
    </section>
  );
}
