import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface RoleBasedRouteProps {
  children: ReactElement;
  allowedRoles: Array<"seller" | "store" | "admin">;
}

/**
 * RoleBasedRoute wrapper component
 * Checks both authentication and user role
 * Redirects unauthenticated users to sign-in
 * Redirects unauthorized users to their appropriate dashboard
 */
export const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(user.role || "seller")) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === "admin") {
      return <Navigate to="/admin/stores" replace />;
    } else if (user.role === "store") {
      return <Navigate to="/store/inventory" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has correct role
  return children;
};
