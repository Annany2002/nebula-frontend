import { useRef, useState, useSyncExternalStore } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, ShieldCheck, CircleCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layout/AuthLayout";
import { useAuth } from "@/context/auth-context";
import { useAccountCooldown } from "@/hooks/useAccountCooldown";
import {
  AccountError,
  accountEmailSchema,
  resendAccountVerification,
  verifyAccountEmail,
} from "@/lib/account";
import {
  forgetVerificationLink,
  getVerificationLink,
  subscribeVerificationLink,
} from "@/lib/verificationLink";

const VerifyEmail = () => {
  const location = useLocation();
  const { clearSession } = useAuth();
  const link = useSyncExternalStore(subscribeVerificationLink, getVerificationLink);
  const [email, setEmail] = useState(() =>
    typeof location.state?.email === "string" ? location.state.email : ""
  );
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState<"confirm" | "resend" | null>(null);
  const inFlight = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(() =>
    location.state?.delivery === "unconfirmed"
      ? "Your account was created, but email delivery couldn’t be confirmed. You can request another email below."
      : ""
  );
  const cooldown = useAccountCooldown();

  const confirm = async () => {
    if (inFlight.current || !link.token) return;
    inFlight.current = true;
    setBusy("confirm");
    setError("");
    try {
      await verifyAccountEmail(link.token);
      forgetVerificationLink();
      clearSession();
      setVerified(true);
    } catch (failure) {
      setError(
        failure instanceof AccountError
          ? failure.message
          : "Couldn’t confirm this email. Please try again."
      );
      if (failure instanceof AccountError && failure.code === "invalid_verification_token") {
        forgetVerificationLink();
      }
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  };

  const resend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlight.current || cooldown.remaining) return;
    const valid = accountEmailSchema.safeParse(email);
    if (!valid.success) {
      setError("Enter a valid email address to request a verification email.");
      return;
    }
    inFlight.current = true;
    setBusy("resend");
    setError("");
    setNotice("");
    try {
      await resendAccountVerification(email);
      setNotice(
        "If this address needs verification, an email will be sent. Check your inbox and spam folder."
      );
      cooldown.start(60);
    } catch (failure) {
      setError(
        failure instanceof AccountError
          ? failure.message
          : "Couldn’t request an email. Please try again."
      );
      if (failure instanceof AccountError && failure.retryAfter) cooldown.start(failure.retryAfter);
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  };

  return (
    <AuthLayout
      icon={
        verified ? (
          <CircleCheck size={28} />
        ) : link.token ? (
          <ShieldCheck size={28} />
        ) : (
          <Mail size={28} />
        )
      }
      title={
        verified ? "Email confirmed." : link.token ? "Confirm your email." : "Check your inbox."
      }
      description={
        verified
          ? "Your email verification is complete. Sign in to continue."
          : link.token
            ? "Confirm this link to verify your address or finish your requested email change."
            : "Open the verification link in your email. Need a new one? Request it below."
      }
      footerText="Ready to continue?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
    >
      <div className="auth-verification-content">
        {link.invalid && (
          <p className="auth-notice" role="alert">
            This link is incomplete or invalid. Reopen the original email link or request another.
          </p>
        )}
        {error && (
          <p className="auth-notice auth-notice-error" role="alert">
            {error}
          </p>
        )}
        {notice && !verified && (
          <p className="auth-notice" role="status">
            {notice}
          </p>
        )}
        {verified ? (
          <Button className="auth-submit" asChild>
            <Link to="/sign-in">Continue to sign in</Link>
          </Button>
        ) : (
          <>
            {link.token && (
              <div className="auth-confirmation">
                <p>
                  You’ll need to sign in again after confirmation. Your current address stays active
                  until a requested change is confirmed.
                </p>
                <Button className="auth-submit" onClick={confirm} disabled={!!busy}>
                  {busy === "confirm" ? (
                    <>
                      <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
                      Confirming…
                    </>
                  ) : (
                    "Confirm email"
                  )}
                </Button>
              </div>
            )}
            <form
              className="auth-form auth-resend"
              onSubmit={resend}
              aria-label="Request verification email"
              noValidate
            >
              <div>
                <Label htmlFor="verification-email">Email address</Label>
                <Input
                  id="verification-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={!!busy}
                  required
                />
              </div>
              <Button
                type="submit"
                className={link.token ? undefined : "auth-submit"}
                variant={link.token ? "outline" : "default"}
                disabled={!!busy || cooldown.remaining > 0}
              >
                {busy === "resend" ? (
                  <>
                    <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
                    Requesting…
                  </>
                ) : cooldown.remaining ? (
                  `Request again in ${cooldown.remaining}s`
                ) : (
                  "Send verification email"
                )}
              </Button>
              <p className="auth-verification-help">
                Never share a verification link. If you’ve already confirmed your email, try signing
                in.
              </p>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
};
export default VerifyEmail;
