import { Navigate } from "react-router-dom";
import { useAuth } from "./use-auth-client";
import NavDrawer from "./components/NavDrawer/NavDrawer";
import { Box } from "@chakra-ui/react";
import BottomTabNav from "./components/BottomNav/BottomTabNav";
import Balance from "./components/Balance";
import React from "react";
import { ChildContext } from "./contexts/ChildContext";
import useIsMobileLayout from "./hooks/useIsMobileLayout";
import ReactPullToRefresh from "react-pull-to-refresh";

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
      <ReactPullToRefresh
        onRefresh={() => {
          refetchContent({ init: true });
        }}
        style={{ textAlign: "center" }}
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
      </ReactPullToRefresh>
      {showMobileLayout && <BottomTabNav />}
    </Box>
  );
}

export default ProtectedRoute;
