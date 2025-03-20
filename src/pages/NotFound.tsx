
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10">
      <div className="text-center p-8 glass max-w-md">
        <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600 dark:from-purple-400 dark:to-purple-300 animate-gradient-flow">404</h1>
        <p className="text-xl mb-8 text-gray-700 dark:text-gray-300 animate-fade-in">Oops! This page couldn't be found.</p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="bg-purple-600 hover:bg-purple-700 inline-flex items-center animate-fade-in-delayed"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
