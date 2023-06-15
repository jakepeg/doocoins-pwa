import React from "react";
import { useAuth } from "../use-auth-client";
import { Navigate } from "react-router-dom";
import { Box, Button, Link, Text } from "@chakra-ui/react";
import ICBadge from "../assets/images/ic-badge.svg";
import logo from "../assets/images/logo.svg";

function LoggedOut() {
  const { login, isAuthenticated, isLoading } = useAuth();
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      className="container"
      display="flex"
      flexDirection="column"
      justifyContent={"space-between"}
      alignItems={"center"}
      gap={6}
      py={8}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent={"space-between"}
        alignItems={"center"}
        gap={2}
        mt={4}
        px={10}
        style={{ width: "100%" }}
      >
        <img className="logo" src={logo} alt="DooCoins" />
        <Text fontSize="3xl" color={"#fff"}>
          DooCoins
        </Text>
        <Text fontSize="xl" color={"#fff"}>
          Kids Rewards dApp
        </Text>
        <Text fontSize="lg" mt={2} fontWeight={"bold"} color={"#139EAA"}>
          <Link>find out more</Link>
        </Text>
        <Button
          variant="ghost"
          color={"#fff"}
          mt={5}
          style={{ width: "100%" }}
          className="button"
          type="button"
          onClick={login}
          fontSize={18}
          fontWeight={"medium"}
          py={6}
        >
          Connect
        </Button>
      </Box>
      <Box>
        <img src={ICBadge} alt="Internet Computer" />
      </Box>
    </Box>
  );
}

export default LoggedOut;
