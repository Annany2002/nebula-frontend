import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Lazy load pages
const AllTables = lazy(() => import("./pages/AllTables"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const SingleTable = lazy(() => import("./pages/SingleTable"));
const Profile = lazy(() => import("./pages/Profile"));

export const url = import.meta.env.VITE_BACKEND_URL as string;

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
          <BrowserRouter>
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
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/dashboard/:userId" element={<Dashboard />} />
                  <Route path="/databases/:db_name/tables" element={<AllTables />} />
                  <Route path="/databases/:db_name/tables/:table_name" element={<SingleTable />} />
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
