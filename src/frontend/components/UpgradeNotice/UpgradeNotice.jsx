import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  ScaleFade,
  Alert,
  AlertIcon,
  Stack,
  useToast,
  CloseButton,
} from "@chakra-ui/react";
import useIsMobileLayout from "../../hooks/useIsMobileLayout";
import MigrationStorage from "../../utils/migrationStorage";
import MigrationConfig from "../../utils/migrationConfig";
import { useAuth } from "../../use-auth-client";

const UpgradeNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const showMobileLayout = useIsMobileLayout();
  const toast = useToast();
  const { actor, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Don't show anything while still loading
    if (isLoading) {
      setIsVisible(false);
      return;
    }

    // Don't show if not authenticated
    if (!isAuthenticated) {
      setIsVisible(false);
      return;
    }
    
    // Check migration storage logic (still needs NFID principal and dismissal logic)
    const shouldShow = MigrationStorage.shouldShowUpgradeNotice();
    console.log("UpgradeNotice - shouldShow:", shouldShow);
    setIsVisible(shouldShow);
  }, [isAuthenticated, isLoading]);

  const handleUpgradeNow = async () => {
    // Check if user has children to migrate
    if (actor) {
      try {
        const childrenResult = await actor.getChildren();
        const hasChildren = childrenResult.ok && childrenResult.ok.length > 0;
        
        if (hasChildren) {
          // User has data to migrate - include migration parameters
          const nfidPrincipal = MigrationStorage.getNfidPrincipal();
          if (!nfidPrincipal) {
            toast({
              title: "Error",
              description: MigrationConfig.MESSAGES.ERROR_NO_PRINCIPAL,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            return;
          }

          if (MigrationConfig.ENABLE_LOGGING) {
            console.log("Redirecting to V2 with NFID principal:", nfidPrincipal);
          }

          // Redirect to V2 frontend with NFID principal in URL
          const v2UrlWithPrincipal = `${MigrationConfig.V2_FRONTEND_URL}?migrate=true&nfid=${encodeURIComponent(nfidPrincipal)}`;
          window.location.href = v2UrlWithPrincipal;
        } else {
          // User has no data to migrate - redirect without parameters
          console.log("User has no children, redirecting to V2 without migration parameters");
          window.location.href = MigrationConfig.V2_FRONTEND_URL;
        }
      } catch (error) {
        console.error("Error checking children:", error);
        // If we can't check, default to clean redirect
        window.location.href = MigrationConfig.V2_FRONTEND_URL;
      }
    } else {
      // No actor available, default to clean redirect
      window.location.href = MigrationConfig.V2_FRONTEND_URL;
    }
  };

  const handleRemindLater = () => {
    MigrationStorage.dismissUpgradeNotice();
    setIsVisible(false);

    toast({
      title: "Reminder set",
      description: MigrationConfig.MESSAGES.REMINDER_SET,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    console.log("UpgradeNotice - not visible, returning null");
    return null;
  }

  console.log("UpgradeNotice - rendering banner component");
  
  return (
    <ScaleFade initialScale={0.9} in={isVisible}>
      <Box
        position={showMobileLayout ? "relative" : "fixed"}
        top={showMobileLayout ? "0" : "20px"}
        left={showMobileLayout ? "0" : "20px"}
        right={showMobileLayout ? "0" : "20px"}
        zIndex={1000}
        mx={showMobileLayout ? 4 : 0}
        mt={showMobileLayout ? 2 : 0}
      >
        <Alert
          status="info"
          variant="subtle"
          borderRadius="md"
          boxShadow="lg"
          bg="blue.50"
          border="1px solid"
          borderColor="blue.200"
          position="relative"
        >
          <AlertIcon color="blue.500" />
          <Box flex="1">
            <Stack spacing={3}>
              <Text fontWeight="bold" color="blue.800" fontSize="md">
                {MigrationConfig.MESSAGES.UPGRADE_TITLE}
              </Text>
              <Text color="blue.700" fontSize="sm">
                {MigrationConfig.MESSAGES.UPGRADE_DESCRIPTION}
              </Text>
              <Stack 
                direction={showMobileLayout ? "column" : "row"} 
                spacing={2}
                align={showMobileLayout ? "stretch" : "center"}
              >
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={handleUpgradeNow}
                  fontWeight="bold"
                  _hover={{ bg: "blue.600" }}
                >
                  {MigrationConfig.MESSAGES.UPGRADE_BUTTON}
                </Button>
                <Button
                  variant="outline"
                  colorScheme="blue"
                  size="sm"
                  onClick={handleRemindLater}
                  _hover={{ bg: "blue.50" }}
                >
                  {MigrationConfig.MESSAGES.REMIND_LATER_BUTTON}
                </Button>
              </Stack>
            </Stack>
          </Box>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={handleDismiss}
            size="sm"
            color="blue.600"
          />
        </Alert>
      </Box>
    </ScaleFade>
  );
};

export default UpgradeNotice;