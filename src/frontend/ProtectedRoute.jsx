import { Navigate } from "react-router-dom";
import { useAuth } from "./use-auth-client";
import NavDrawer from "./components/NavDrawer/NavDrawer";
import { Box } from "@chakra-ui/react";
import BottomTabNav from "./components/BottomNav/BottomTabNav";
import Balance from "./components/Balance";
import React from "react";
import { ChildContext } from "./contexts/ChildContext";
import useIsMobileLayout from "./hooks/useIsMobileLayout";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { child } = React.useContext(ChildContext);
  const showMobileLayout = useIsMobileLayout();
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box className="container" backgroundColor={!showMobileLayout && "#0B334D"} gap={0}>
      <NavDrawer />
      {showMobileLayout && (
        <Balance childName={child?.name} childBalance={child?.balance} />
      )}
      {children}
      {showMobileLayout && <BottomTabNav />}
    </Box>
  );
}

export default ProtectedRoute;
