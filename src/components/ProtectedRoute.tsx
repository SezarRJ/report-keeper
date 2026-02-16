import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";

/**
 * PROTOTYPE_MODE:
 * - When true and demo_unlocked=1, we allow access to protected pages
 *   even if Supabase auth/restaurant isn't ready yet.
 * - This prevents being stuck on /setup forever during UI prototype.
 */
const PROTOTYPE_MODE = true;

const isDemoUnlocked = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("demo_unlocked") === "1";
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Prototype bypass
  if (PROTOTYPE_MODE && isDemoUnlocked()) {
    return <>{children}</>;
  }

  const { user, loading: authLoading } = useAuth();
  const { restaurant, loading: restLoading } = useRestaurant();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [user, authLoading, navigate, location.pathname]);

  // Redirect to setup if user exists but restaurant is not configured
  useEffect(() => {
    if (!authLoading && !restLoading && user && !restaurant) {
      navigate("/setup", { replace: true });
    }
  }, [user, authLoading, restaurant, restLoading, navigate]);

  if (authLoading || restLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If still missing, do not render protected content
  if (!user || !restaurant) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
