import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Github, Loader2 } from "lucide-react";
import AuthPanel from "@/components/auth/AuthPanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { AccountError } from "@/lib/account";
import { getGitHubCallbackStatus } from "@/lib/github-oauth";

export default function GitHubCallback() {
  const initial = getGitHubCallbackStatus();
  const { completeGitHub } = useAuth();
  const [error, setError] = useState(initial.kind === "error" ? initial.message : "");
  const [busy, setBusy] = useState(false);
  const attempted = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const submit = async () => {
    if (attempted.current) return;
    attempted.current = true;
    setBusy(true);
    try {
      await completeGitHub();
    } catch (failure) {
      if (!mounted.current) return;
      const message =
        failure instanceof AccountError
          ? failure.message
          : "GitHub sign-in could not be confirmed.";
      setError(
        `${message} Start a fresh GitHub sign-in to continue. If you were connecting GitHub, try signing in with GitHub to check whether the connection completed.`
      );
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const linking = initial.kind === "ready" && initial.mode === "link";
  return (
    <AuthPanel
      icon={<Github size={24} />}
      title={
        error
          ? "Let’s try that again."
          : linking
            ? "Connect your GitHub account."
            : "Continue to your workspace."
      }
      description={
        error
          ? "Return to sign in to start a new request."
          : linking
            ? "Confirm to connect the GitHub account you selected. You’ll sign in again afterward."
            : "GitHub has returned you to Nebula. Confirm below to finish signing in."
      }
      footerText="Use another sign-in method?"
      footerLinkText="Sign in with email"
      footerLinkHref="/sign-in"
    >
      {error ? (
        <div className="auth-form">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button asChild variant="outline">
            <Link to="/sign-in" replace>
              Back to sign in
            </Link>
          </Button>
        </div>
      ) : (
        <Button className="auth-submit" onClick={submit} disabled={busy}>
          {busy && (
            <Loader2
              size={16}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {busy ? "Confirming…" : linking ? "Confirm connection" : "Finish signing in"}
        </Button>
      )}
    </AuthPanel>
  );
}
