import { useEffect, useRef, useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/auth/PasswordInput";
import { Label } from "@/components/ui/label";
import { useGitHubProvider } from "@/hooks/useGitHubProvider";
import { useAccountCooldown } from "@/hooks/useAccountCooldown";
import { AccountError } from "@/lib/account";
import { beginGitHub } from "@/lib/github-oauth";

export default function GitHubSignIn({
  link = false,
  disabled = false,
}: {
  link?: boolean;
  disabled?: boolean;
}) {
  const enabled = useGitHubProvider();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController>();
  const cooldown = useAccountCooldown();
  useEffect(() => () => controller.current?.abort(), []);
  if (!enabled) return null;
  const start = async (event: React.FormEvent) => {
    event.preventDefault();
    if (controller.current || disabled || cooldown.remaining) return;
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    setError("");
    const currentPassword = password;
    setPassword("");
    try {
      await beginGitHub(request.signal, link ? currentPassword : undefined);
    } catch (failure) {
      if (request.signal.aborted) return;
      setError(
        failure instanceof AccountError
          ? failure.message
          : "Couldn’t start GitHub sign-in. Try again."
      );
      if (failure instanceof AccountError && failure.retryAfter) cooldown.start(failure.retryAfter);
    } finally {
      if (!request.signal.aborted) {
        controller.current = undefined;
        setBusy(false);
      }
    }
  };
  return (
    <div className={link ? "profile-github" : "auth-github"}>
      {link && (
        <>
          <h2>Connect GitHub</h2>
          <p>
            Use GitHub to sign in to this account. Confirm your Nebula password before choosing a
            GitHub account. Connecting signs out your existing sessions.
          </p>
          <p>
            Already sign in with GitHub? No further connection is needed. Replacing or disconnecting
            an identity is not supported.
          </p>
        </>
      )}
      <form
        onSubmit={start}
        className="auth-form"
        aria-label={link ? "Connect GitHub" : "GitHub sign-in"}
      >
        {link && (
          <div>
            <Label htmlFor="github-link-password">Current password</Label>
            <PasswordInput
              id="github-link-password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy || disabled}
              required
            />
          </div>
        )}
        <Button
          type="submit"
          variant="outline"
          className="w-full min-h-11"
          disabled={busy || disabled || cooldown.remaining > 0}
        >
          {busy ? (
            <Loader2
              size={16}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Github size={16} aria-hidden="true" />
          )}
          {busy
            ? "Opening GitHub…"
            : cooldown.remaining
              ? `Try again in ${cooldown.remaining}s`
              : link
                ? "Connect GitHub"
                : "Continue with GitHub"}
        </Button>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </form>
      {!link && (
        <div className="auth-divider">
          <span>or use email</span>
        </div>
      )}
    </div>
  );
}
