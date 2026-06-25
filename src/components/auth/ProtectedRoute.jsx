import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "../../store/appStore";

export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useAppStore();
  const location = useLocation();

  if (authLoading) return null; // still loading
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}
