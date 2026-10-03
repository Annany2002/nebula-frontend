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
  username: z.string().min(6, "Username must be at least 6 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const SignUp = () => {
  const { signup, isLoading } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await signup({
      email: data.email,
      username: data.username,
      password: data.password,
    });
  };

  return (
    <AuthLayout
      title="Create your workspace."
      description="Start building with your own database backend."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
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
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input autoComplete="username" placeholder="nebula_user" type="text" {...field} />
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
                    autoComplete="new-password"
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
                Creating account…
              </>
            ) : (
              <>
                Create account
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default SignUp;
