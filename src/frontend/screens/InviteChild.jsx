import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import modelStyles from "../components/popup/confirmation_popup.module.css";
import { Box, Button, Text } from "@chakra-ui/react";

const InviteChild = () => {
  const child = useLocation()?.state?.child;
  const [hasNFT, setHasNFT] = useState(true);
  const [loading, setLoading] = useState(true);
  const [magicCode, setMagicCode] = useState([1, 2, 3, 4]);
    console.log(`child`, child);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(false);
    // TODO Call backend to check if user owns Dooza NFT
  }, []);

  if (!child) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems={"center"}
        height={"100vh"}
        flexDirection='column'
        gap={'20px'}
      >
        <Text color={"#fff"} align={"center"} fontSize="xl">
          Please select a child to continue
        </Text>

        <Button onClick={() => navigate("/")}>Visit Home</Button>
      </Box>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box className="container">
      {hasNFT && (
        <Box
          mx={"20px"}
          mt={"40px"}
          display="flex"
          gap={"16px"}
          flexDirection="column"
          justifyContent={"center"}
        >
          <Text fontSize="xl" color="#fff">
            Invite {child.name}
          </Text>
          <Text fontSize="xl" color="#fff">
            Get your child on board with DooCoins Kids!
          </Text>

          <Box as="ol" ml="20px" color="#fff">
            <Box as="li" fontSize="xl">
              Install the Kids App:
            </Box>
            <Box as="li" fontSize="xl">
              Enter the magic code:
            </Box>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={"4px"}
          >
            {magicCode.map((code) => {
              return (
                <Text key={code} fontSize="3xl" color="#fff">
                  {code}
                </Text>
              );
            })}
          </Box>
          <Text fontSize="xl" color="#fff" align="center">
            The code expires after 1 hour
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default InviteChild;
