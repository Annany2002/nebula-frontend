import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/auth/PasswordInput";
import {
  AccountError,
  AccountProfile,
  accountEmailSchema,
  updateAccountProfile,
} from "@/lib/account";
import { useAccountCooldown } from "@/hooks/useAccountCooldown";

export default function AccountEmail({
  profile,
  onUpdated,
}: {
  profile: AccountProfile;
  onUpdated: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const changeButton = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState("");
  const cooldown = useAccountCooldown();
  const pendingEmail = pending || profile.pending_email;
  useEffect(() => {
    if (!editing && wasEditing.current) changeButton.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inFlight.current || cooldown.remaining) return;
    if (!accountEmailSchema.safeParse(email).success || email === profile.email || !password) {
      setError("Enter a different valid email address and your current password.");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    // Keep the password out of mutation/query caches and clear the field before sending.
    const credentials = { email, current_password: password };
    setPassword("");
    try {
      const result = await updateAccountProfile(credentials);
      if (result.kind === "pending") {
        setPending(result.email);
        setNotice(
          "Confirmation requested. Check the new inbox and spam folder. Your current email remains active until confirmed."
        );
        cooldown.start(60);
        void queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      } else {
        setPending("");
        setNotice("Email address updated.");
        queryClient.setQueryData(["currentUser"], result.user);
        await onUpdated();
      }
      setEditing(false);
    } catch (failure) {
      setError(
        failure instanceof AccountError
          ? failure.message
          : "Couldn’t request an email change. Please try again."
      );
      if (failure instanceof AccountError && failure.retryAfter) cooldown.start(failure.retryAfter);
      // A timeout may follow a completed write; refresh durable pending intent before retrying.
      if (failure instanceof AccountError && failure.outcomeUnknown)
        void queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="profile-email">
      <div className="profile-email-value">
        <span>{profile.email}</span>
        {profile.email_verified === true ? (
          <span className="profile-email-status">
            <ShieldCheck size={13} aria-hidden="true" />
            Verified
          </span>
        ) : profile.email_verified === false ? (
          <span className="profile-email-status">Not verified</span>
        ) : null}
      </div>
      {pendingEmail && (
        <p className="profile-email-pending" role={notice ? "status" : undefined}>
          Awaiting confirmation: <strong>{pendingEmail}</strong>
          <br />
          Your current email stays active. Open the link in the new inbox or spam folder, then sign
          in again. Request a new link below if it expired.
        </p>
      )}
      {notice && !pendingEmail && (
        <p className="profile-email-pending" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {editing ? (
        <form
          onSubmit={submit}
          className="profile-email-form"
          aria-label="Change email address"
          noValidate
        >
          <div>
            <Label htmlFor="new-account-email">New email address</Label>
            <Input
              id="new-account-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={busy}
              required
            />
          </div>
          <div>
            <Label htmlFor="email-change-password">Current password</Label>
            <PasswordInput
              id="email-change-password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
              required
            />
          </div>
          <p>
            Servers with email verification send a confirmation link before changing your address.
            Other servers update it immediately.
          </p>
          <div className="profile-form-actions">
            <Button type="submit" disabled={busy || cooldown.remaining > 0}>
              {busy ? (
                <>
                  <Loader2 size={15} className="animate-spin motion-reduce:animate-none" />
                  Requesting…
                </>
              ) : cooldown.remaining ? (
                `Try again in ${cooldown.remaining}s`
              ) : (
                "Request email change"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setPassword("");
                setError("");
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          ref={changeButton}
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setEmail(pendingEmail || "");
            setError("");
            setNotice("");
            setEditing(true);
          }}
        >
          Change email
        </Button>
      )}
    </div>
  );
}
