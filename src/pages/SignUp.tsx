import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Eye, EyeOff, Github } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      username: ""
    },
  });

  const onSubmit = async (data: FormValues) => {
    signup({ email: data.email, username: data.username, password: data.password });
  };

  return (
    <AuthLayout
      title="Create a new account"
      description="Sign up to use our services"
      footerText="Already a user?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <Input
                    placeholder="nebula_user"
                    type="text"
                    {...field}
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
                  <div className="relative">
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </Button>
          <div className="w-full flex items-center gap-2">
            <div className="h-[0.5px] w-full  bg-white/10" />
            or
            <div className="h-[0.5px] w-full  bg-white/10" />
          </div>
          <Button className="w-full bg-transparent border border-white/10 hover:bg-transparent hover:border-purple-500 rounded-3xl">
            Continue with Github <Github />
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default SignUp;
