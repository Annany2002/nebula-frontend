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
      <Card className="w-full max-w-md bg-background/50 backdrop-blur-lg border border-white/10">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="w-full flex justify-center h-12 mb-2">
            <NebulaLogo />
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
