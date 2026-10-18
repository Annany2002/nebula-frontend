import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthLayout from "@/layout/AuthLayout";
import {
  loadSignIn,
  loadSignUp,
  loadForgotPassword,
  loadResetPassword,
  loadVerifyEmail,
  loadGitHubCallback,
} from "@/lib/auth-pages";

// Lazy load pages
const AllTables = lazy(() => import("./pages/AllTables"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Backups = lazy(() => import("./pages/Backups"));
const DatabaseStudio = lazy(() => import("./pages/DatabaseStudio"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SignIn = lazy(loadSignIn);
const SignUp = lazy(loadSignUp);
const ForgotPassword = lazy(loadForgotPassword);
const ResetPassword = lazy(loadResetPassword);
const VerifyEmail = lazy(loadVerifyEmail);
const GitHubCallback = lazy(loadGitHubCallback);
const SingleTable = lazy(() => import("./pages/SingleTable"));
const Profile = lazy(() => import("./pages/Profile"));
const Administration = lazy(() => import("./pages/Administration"));

export { url } from "@/lib/config";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="nebula-ui-theme">
        <Analytics />
        <Toaster />
        <div className="min-h-screen relative">
          <AnimatedBackground />
          {/* Keep the current page visible while a lazy route loads. */}
          <BrowserRouter future={{ v7_startTransition: true }}>
            <AuthProvider>
              <Suspense
                fallback={
                  <div className="flex h-screen w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route element={<AuthLayout />}>
                    <Route path="/auth/github/callback" element={<GitHubCallback />} />
                    <Route path="/sign-in" element={<SignIn />} />
                    <Route path="/sign-up" element={<SignUp />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                  </Route>

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/backups" element={<Backups />} />
                    <Route path="/dashboard/:userId" element={<Dashboard />} />
                    <Route path="/databases/:db_name/*" element={<DatabaseStudio />} />
                    <Route path="/databases/:db_name" element={<DatabaseStudio />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin/*" element={<Administration />} />
                  </Route>

                  {/* Catch-all 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
