import React, { useState } from "react";
import { useAuth } from "../use-auth-client";
import { Navigate } from "react-router-dom";
import { Box, Button, Link, Text, isChakraTheme } from "@chakra-ui/react";
import ICBadge from "../assets/images/ic-badge.svg";
import ShareIcon from "../assets/images/share-icon.svg";
import logo from "../assets/images/logo.svg";
import useClearContextState from "../hooks/useClearContextState";
import MagicCode from "../components/MagicCode";
import { set } from "idb-keyval";
import { ChildContext } from "../contexts/ChildContext";

function checkForIOS() {
  // already installed
  if (navigator.standalone) {
    return false;
  }

  const ua = window.navigator.userAgent;
  const webkit = !!ua.match(/WebKit/i);
  const isIPad = !!ua.match(/iPad/i);
  const isIPhone = !!ua.match(/iPhone/i);
  const isMacOS = !!ua.match(/Macintosh/i);
  const isIOS = isIPad || isIPhone;
  const isSafari = isIOS && webkit && !ua.match(/CriOS/i);
  const isIOSWithSafari = isIOS && isSafari;
  const isMacOSWithSafari = isMacOS && webkit && !ua.match(/(Chrome|Firefox)/i);

  if (isIOSWithSafari) {
    return "iOS";
  } else if (isMacOSWithSafari) {
    return "macOS";
  } else {
    return false;
  }
}

function LoggedOut() {
  const { login, isAuthenticated, isLoading, logout, store, actor } = useAuth();
  const { getBalance, handleUpdateChild } = React.useContext(ChildContext);
  const [code, setCode] = useState(null);
  const [error, setError] = useState("");
  const clearContextState = useClearContextState();
  const [checkingCode, setCheckingCode] = useState(false)

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      logout();
      clearContextState();
    }
  }, []);

  const verifyChild = async () => {
    if (checkingCode) {
      return;
    }
    if (!code) {
      setError("Please enter verification code");
      return;
    }
    setCheckingCode(true)
    const data = await login(code);
    setCheckingCode(false)

    if (!data) {
      setError("Incorrect magic code.");
      return;
    }
    if (data?.error) {
      setError(data?.error);
      return;
    }

    set("selectedChild", data, store)
    const balance = await getBalance(data);
    const name = await actor.getChild(data);
    console.log(`name`, name);
    set("selectedChildName", name, store)

    handleUpdateChild({ id: data, name: 'Test', balance: parseInt(balance) })
  };

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
      backgroundColor={"#0B334D"}
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
          DooCoins Kids
        </Text>
        <Text fontSize="xl" color={"#fff"}>
          Kids Rewards App
        </Text>
        <Text fontSize="lg" mt={2} fontWeight={"bold"} color={"#00A4D7"}>
          <Link href="https://www.doo.co" target="_blank">
            find out more
          </Link>
        </Text>
        <Text fontSize="2xl" color={"#fff"} mt={4}>
          Enter Magic Code
        </Text>
        <MagicCode updateCode={setCode} />
        {error ? (
          <Text fontSize="xl" color="red.400" mt={4}>
            {error}
          </Text>
        ) : null}
        <Button
          variant="ghost"
          color={"#fff"}
          mt={5}
          style={{ width: "100%" }}
          className="button"
          type="button"
          onClick={verifyChild}
          fontSize={18}
          fontWeight={"medium"}
          py={6}
          _hover={{}}
          _active={{}}
          disabled={checkingCode}
        >
          {checkingCode ? 'Verifying...' : 'Connect'}
        </Button>

        <Text fontSize="lg" mt={2} fontWeight={"bold"} color={"#00A4D7"}>
          <Link href="/" target="_blank">
            I don't have a code!
          </Link>
        </Text>

        <Box>
          {checkForIOS() ? (
            <div className="install-prompt">
              <p className="light prompt-text">
                Install for a better experience
              </p>
              <p className="light prompt-text">
                Tap{" "}
                <img src={ShareIcon} className="share-icon" alt="Install PWA" />{" "}
                then "Add to Home Screen"{" "}
              </p>
            </div>
          ) : (
            ""
          )}
        </Box>
      </Box>
      <Box>
        <img src={ICBadge} alt="Internet Computer" />
      </Box>
    </Box>
  );
}

export default LoggedOut;
