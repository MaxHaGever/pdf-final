import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}
