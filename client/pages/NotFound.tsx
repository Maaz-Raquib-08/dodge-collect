import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-accent/40 flex items-center justify-center px-6 py-24">
      <div className="text-center">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Error</div>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-brand hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
