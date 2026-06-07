import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-player-bg text-player-text">
      <div className="text-center p-8 glass-card rounded-2xl border border-player-border">
        <h1 className="mb-4 text-6xl font-display font-bold text-player-accent">404</h1>
        <p className="mb-8 text-xl font-display text-player-muted">Oops! Page not found</p>
        <a 
          href="/" 
          className="inline-block px-6 py-2.5 rounded-xl font-mono text-[12px] uppercase tracking-widest transition-all duration-200"
          style={{ background: 'hsl(var(--accent))', color: 'hsl(222 47% 5%)', fontWeight: 600 }}
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
