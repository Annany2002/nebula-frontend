import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight } from "lucide-react";
import PasswordInput from "@/components/auth/PasswordInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/layout/AuthLayout";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const SignIn = () => {
  const { login, isLoading } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await login({ email: data.email, password: data.password });
  };

  return (
    <AuthLayout
      title="Welcome back."
      description="Sign in to your Nebula workspace."
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/sign-up"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    {...field}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default SignIn;
