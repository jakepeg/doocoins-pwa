import { Navigate } from "react-router-dom";
import { useAuth } from "./use-auth-client";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  console.log(`isAuthenticated`, isAuthenticated, `isLoading`, isLoading)

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
