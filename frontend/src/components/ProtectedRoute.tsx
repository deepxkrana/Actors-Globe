import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"ACTOR" | "CASTER" | "ADMIN">;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { user, loading, adminToken } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#F7FFB8] border-t-transparent animate-spin" />
        <span className="text-xs text-[#8A8A90] tracking-wide">Authenticating session...</span>
      </div>
    );
  }

  // Admin access check (either adminToken exists or user.role === 'ADMIN')
  if (allowedRoles?.includes("ADMIN")) {
    if (!adminToken && user?.role !== "ADMIN") {
      return <Navigate to="/admin" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  }

  // Standard user access check
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role validation
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
