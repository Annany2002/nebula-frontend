import { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NebulaLogo } from "@/assets/nebula-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

const AuthLayout = ({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 z-10 relative">
      <div className="fixed top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-purple-200/50 dark:border-white/10 shadow-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="w-full flex justify-center h-12 mb-2">
            <Link
              to="/"
              className="inline-flex items-center hover:opacity-85 transition-opacity"
              aria-label="Nebula Home"
            >
              <NebulaLogo />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            {footerText}{" "}
            <Link
              to={footerLinkHref}
              className="text-primary underline underline-offset-4 hover:text-primary/90"
            >
              {footerLinkText}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthLayout;
