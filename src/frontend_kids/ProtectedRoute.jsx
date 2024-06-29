import { Navigate } from "react-router-dom";
import { useAuth } from "./use-auth-client";
import NavDrawer from "./components/NavDrawer/NavDrawer";
import { Box } from "@chakra-ui/react";
import BottomTabNav from "./components/BottomNav/BottomTabNav";
import Balance from "./components/Balance";
import React from "react";
import { ChildContext } from "./contexts/ChildContext";
import useIsMobileLayout from "./hooks/useIsMobileLayout";
import PullToRefresh from "react-simple-pull-to-refresh";
import ReloadIcon from "./components/icons/ReloadIcon";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { child, refetchContent } = React.useContext(ChildContext);
  const showMobileLayout = useIsMobileLayout();
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box
      className="container"
      backgroundColor={!showMobileLayout && "#0B334D"}
      gap={0}
    >
      <PullToRefresh
        onRefresh={async () => {
          const data = await refetchContent({ refetch: true });
          return data
        }}
        className="text-center"
      >
        <Box
          sx={
            showMobileLayout && {
              backgroundColor: "#F0F7FC",
              display: "flex",
              flexDirection: "column",
            }
          }
          px={"5px"}
        >
          <NavDrawer />
          {showMobileLayout && (
            <Balance childName={child?.name} childBalance={child?.balance} />
          )}
        </Box>
        {children}
      </PullToRefresh>
      {showMobileLayout && <BottomTabNav />}
    </Box>
  );
}

export default ProtectedRoute;
