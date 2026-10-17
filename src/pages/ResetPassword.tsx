import { useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, KeyRound, Loader2 } from "lucide-react";
import AuthLayout from "@/layout/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/auth-context";
import { useAccountCooldown } from "@/hooks/useAccountCooldown";
import { AccountError, accountPasswordSchema, resetAccountPassword } from "@/lib/account";
import {
  forgetPasswordResetLink,
  getPasswordResetLink,
  subscribePasswordResetLink,
} from "@/lib/passwordResetLink";

const schema = z
  .object({ password: accountPasswordSchema, confirmation: z.string() })
  .refine((data) => data.password === data.confirmation, {
    message: "Passwords don’t match",
    path: ["confirmation"],
  });
type Values = z.infer<typeof schema>;

function ResetForm({
  token,
  completed,
  invalidated,
}: {
  token: string;
  completed: () => void;
  invalidated: (message: string) => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmation: "" },
  });
  const inFlight = useRef(false);
  const cooldown = useAccountCooldown();
  const [error, setError] = useState("");
  const [unknown, setUnknown] = useState(false);
  const submit = async ({ password }: Values) => {
    if (inFlight.current || unknown || cooldown.remaining) return;
    inFlight.current = true;
    setError("");
    try {
      await resetAccountPassword(token, password);
      form.reset();
      completed();
    } catch (failure) {
      const message =
        failure instanceof AccountError
          ? failure.message
          : "The reset response couldn’t be confirmed. Try signing in before requesting another link.";
      if (failure instanceof AccountError && failure.code === "invalid_password_reset_token") {
        form.reset();
        invalidated(message);
      } else {
        setError(message);
        setUnknown(!(failure instanceof AccountError) || failure.outcomeUnknown);
      }
      if (failure instanceof AccountError && failure.retryAfter) cooldown.start(failure.retryAfter);
    } finally {
      inFlight.current = false;
    }
  };
  return (
    <>
      {error && (
        <p className="auth-notice auth-notice-error" role="alert">
          {error}
        </p>
      )}
      <Form {...form}>
        <form
          className="auth-form"
          onSubmit={form.handleSubmit(submit)}
          noValidate
          aria-label="Choose a new password"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="new-password"
                    placeholder="Choose a new password"
                    disabled={form.formState.isSubmitting || unknown || cooldown.remaining > 0}
                  />
                </FormControl>
                <FormDescription className="auth-verification-help">
                  Use at least 8 characters and at most 72 UTF-8 bytes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="new-password"
                    placeholder="Enter your new password again"
                    disabled={form.formState.isSubmitting || unknown || cooldown.remaining > 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="auth-verification-help">After resetting, sign in again on your devices.</p>
          <Button
            type="submit"
            className="auth-submit"
            disabled={form.formState.isSubmitting || unknown || cooldown.remaining > 0}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
                Resetting…
              </>
            ) : cooldown.remaining ? (
              `Try again in ${cooldown.remaining}s`
            ) : (
              "Reset password"
            )}
          </Button>
          {unknown && (
            <Button variant="outline" asChild>
              <Link to="/sign-in">Try signing in</Link>
            </Button>
          )}
        </form>
      </Form>
      <Link className="auth-recovery-link" to="/forgot-password">
        Request a new reset link
      </Link>
    </>
  );
}

const ResetPassword = () => {
  const link = useSyncExternalStore(subscribePasswordResetLink, getPasswordResetLink);
  const { clearSession } = useAuth();
  const [outcome, setOutcome] = useState<{ kind: "complete" | "invalid"; message?: string } | null>(
    null
  );
  const complete = outcome?.kind === "complete" && !link.token;
  const invalidated = (message: string) => {
    setOutcome({ kind: "invalid", message });
    forgetPasswordResetLink();
  };
  return (
    <AuthLayout
      icon={complete ? <CircleCheck size={28} /> : <KeyRound size={28} />}
      title={complete ? "Password updated." : "Choose a new password."}
      description={
        complete
          ? "Your password has changed and previous sign-in sessions were revoked."
          : "Open the reset link from your email, then enter and confirm your new password."
      }
      footerText="Ready to continue?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
    >
      <div className="auth-verification-content">
        {complete ? (
          <Button className="auth-submit" asChild>
            <Link to="/sign-in">Continue to sign in</Link>
          </Button>
        ) : link.token ? (
          <ResetForm
            key={link.token}
            token={link.token}
            completed={() => {
              setOutcome({ kind: "complete" });
              forgetPasswordResetLink();
              clearSession();
            }}
            invalidated={invalidated}
          />
        ) : (
          <>
            <p className="auth-notice" role="alert">
              {outcome?.kind === "invalid"
                ? outcome.message
                : link.invalid
                  ? "This reset link is incomplete or invalid. Request a new link."
                  : "No reset link is open. Request one and use the link in your email. For privacy, reloading this page clears the token."}
            </p>
            <Button className="auth-submit" asChild>
              <Link to="/forgot-password">Request a reset link</Link>
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
};
export default ResetPassword;
