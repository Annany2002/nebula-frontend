import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AccountError } from "@/lib/account";
import { avatarFileError, updateAvatar } from "@/lib/avatars";
import AccountAvatar from "@/components/AccountAvatar";
import { Button } from "@/components/ui/button";

export default function AvatarEditor({
  onBusyChange,
  disabled = false,
}: {
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const { user, applyProfile } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => () => request.current?.abort(), [user?.userId]);

  const save = async (file: File | null) => {
    if (request.current || disabled) return;
    const invalid = file && avatarFileError(file);
    setError("");
    setStatus("");
    if (invalid) {
      setError(invalid);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token || !user) {
      setError("Sign in again to update your photo.");
      return;
    }
    const owner = user.userId;
    const controller = new AbortController();
    request.current = controller;
    const current = () =>
      !controller.signal.aborted &&
      localStorage.getItem("token") === token &&
      localStorage.getItem("user_id") === owner;
    setBusy(true);
    onBusyChange?.(true);
    try {
      const profile = await updateAvatar(token, file, controller.signal);
      if (!current()) return;
      if (profile.userId !== owner)
        throw new AccountError(
          "The server returned a different account. Sign in again.",
          200,
          "invalid_response",
          0,
          true
        );
      if (!(await applyProfile(profile, token))) return;
      if (current())
        setStatus(file ? "Photo saved." : "Photo removed. Your initials will appear instead.");
    } catch (caught) {
      if (current())
        setError(
          caught instanceof AccountError ? caught.message : "Couldn’t save your photo. Try again."
        );
    } finally {
      request.current = null;
      if (current()) {
        setBusy(false);
        onBusyChange?.(false);
      }
    }
  };

  return (
    <div className="account-photo" aria-busy={busy}>
      <AccountAvatar user={user} className="account-photo-preview" />
      <div className="account-photo-controls">
        <div className="account-photo-actions">
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose profile photo"
            disabled={busy || disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void save(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy || disabled}
            onClick={() => input.current?.click()}
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin motion-reduce:animate-none" />
            ) : (
              <Camera size={15} />
            )}
            {busy ? "Saving…" : user?.avatar_url ? "Change photo" : "Upload photo"}
          </Button>
          {user?.avatar_url && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy || disabled}
              onClick={() => void save(null)}
            >
              Remove
            </Button>
          )}
        </div>
        <p id="avatar-help">JPEG, PNG or WebP. Up to 2 MiB. Profile photos are public.</p>
        {user?.avatar_source === "github" && <p>Using your GitHub photo.</p>}
        <p role="status" aria-live="polite">
          {status}
        </p>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
