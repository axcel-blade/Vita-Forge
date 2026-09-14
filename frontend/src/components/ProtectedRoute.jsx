/* src/components/ProtectedRoute.jsx */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../services/auth-context";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm font-medium text-gray-600">Loading...</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
