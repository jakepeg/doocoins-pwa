import { Navigate } from "react-router-dom";
import { useAuth } from "./use-auth-client";
import NavDrawer from "./components/NavDrawer/NavDrawer";
import { Box } from "@chakra-ui/react";
import BottomTabNav from "./components/BottomNav/BottomTabNav";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box className="container" gap={0}>
      <NavDrawer />
      {children}
      <BottomTabNav />
    </Box>
  );
}

export default ProtectedRoute;
