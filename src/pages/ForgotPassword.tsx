import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2 } from "lucide-react";
import AuthPanel from "@/components/auth/AuthPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAccountCooldown } from "@/hooks/useAccountCooldown";
import { AccountError, accountEmailSchema, requestPasswordReset } from "@/lib/account";

const schema = z.object({ email: accountEmailSchema });
type Values = z.infer<typeof schema>;
const ForgotPassword = () => {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const inFlight = useRef(false);
  const cooldown = useAccountCooldown();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const submit = async ({ email }: Values) => {
    if (inFlight.current || cooldown.remaining) return;
    inFlight.current = true;
    setNotice("");
    setError("");
    try {
      await requestPasswordReset(email);
      setNotice(
        "If this address is eligible, a reset email will be sent. Check your inbox and spam folder."
      );
      cooldown.start(60);
    } catch (failure) {
      setError(
        failure instanceof AccountError
          ? failure.message
          : "Couldn’t request a reset link. Try again shortly."
      );
      if (failure instanceof AccountError && failure.retryAfter) cooldown.start(failure.retryAfter);
    } finally {
      inFlight.current = false;
    }
  };
  return (
    <AuthPanel
      icon={<Mail size={28} />}
      title="Forgot your password?"
      description="Enter your account email and we’ll send a link to choose a new password."
      footerText="Remember your password?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
    >
      <div className="auth-verification-content">
        {error && (
          <p className="auth-notice auth-notice-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="auth-notice" role="status">
            {notice}
          </p>
        )}
        <Form {...form}>
          <form
            className="auth-form"
            onSubmit={form.handleSubmit(submit)}
            noValidate
            aria-label="Request password reset"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      placeholder="you@example.com"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="auth-submit"
              type="submit"
              disabled={form.formState.isSubmitting || cooldown.remaining > 0}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
                  Requesting…
                </>
              ) : cooldown.remaining ? (
                `Request again in ${cooldown.remaining}s`
              ) : (
                "Send reset link"
              )}
            </Button>
            <p className="auth-verification-help">
              Requesting a link won’t change your password or sign you out.
            </p>
          </form>
        </Form>
      </div>
    </AuthPanel>
  );
};
export default ForgotPassword;
