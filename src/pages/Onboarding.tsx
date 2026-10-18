import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AccountError } from "@/lib/account";
import { completeOnboarding } from "@/lib/avatars";
import LoginNavBar from "@/components/LoginNavbar";
import AvatarEditor from "@/components/auth/AvatarEditor";
import { Button } from "@/components/ui/button";
import "@/styles/profile.css";

export default function Onboarding() {
  const { user, applyProfile } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), [user?.userId]);
  const finish = async () => {
    if (request.current || uploading || !user) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const id = user.userId;
    const controller = new AbortController();
    request.current = controller;
    const current = () =>
      !controller.signal.aborted &&
      token === localStorage.getItem("token") &&
      id === localStorage.getItem("user_id");
    setSaving(true);
    setError("");
    try {
      const profile = await completeOnboarding(token, controller.signal);
      if (!current()) return;
      if (profile.userId !== id)
        throw new AccountError(
          "The server returned a different account. Sign in again.",
          200,
          "invalid_response",
          0,
          true
        );
      if (!(await applyProfile(profile, token))) return;
      if (current()) navigate(`/dashboard/${id}`, { replace: true });
    } catch (caught) {
      if (current())
        setError(caught instanceof AccountError ? caught.message : "Couldn’t continue. Try again.");
    } finally {
      request.current = null;
      if (current()) setSaving(false);
    }
  };
  return (
    <div className="nebula-profile min-h-screen">
      <LoginNavBar />
      <main className="onboarding-main">
        <p className="onboarding-eyebrow">Your Nebula account</p>
        <h1>A face for your workspace.</h1>
        <p className="onboarding-intro">
          Add a profile photo, or keep your initials. You can change it anytime in Your account.
        </p>
        <section className="onboarding-photo" aria-label="Set up your profile photo">
          <h2>{user?.username}</h2>
          <AvatarEditor key={user?.userId} disabled={saving} onBusyChange={setUploading} />
        </section>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="onboarding-actions">
          <Button disabled={saving || uploading} onClick={() => void finish()}>
            {saving ? (
              <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
            ) : (
              <ArrowRight size={16} />
            )}
            {saving ? "Continuing…" : user?.avatar_url ? "Continue to projects" : "Skip for now"}
          </Button>
        </div>
      </main>
    </div>
  );
}
