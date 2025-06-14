import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import AllTables from "./pages/AllTables";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import SingleTable from "./pages/SingleTable";

export const url = import.meta.env.VITE_BACKEND_URL as string;

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nebula-ui-theme">
      <Analytics />
      <Toaster />
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/dashboard/:userId" element={<Dashboard />} />
              <Route
                path="/databases/:db_name/tables"
                element={<AllTables />}
              />
              <Route
                path="/databases/:db_name/tables/:table_name"
                element={<SingleTable />}
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
};

export default App;
