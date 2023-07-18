import {
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as NavLink } from "react-router-dom";
import React from "react";
import ProfileIcon from "../../assets/images/profile-icon.svg";
import LogoIcon from "../../assets/images/logo.svg";
import { useAuth } from "../../use-auth-client";
import useIsMobileLayout from "../../hooks/useIsMobileLayout";
import useClearContextState from "../../hooks/useClearContextState";

function NavDrawer() {
  const { logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const showMobileLayout = useIsMobileLayout();
  const clearContextState = useClearContextState()

  return (
    <>
      <Stack
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        style={{ zIndex: 9, position: "relative" }}
        px={showMobileLayout && 4}
        pt={showMobileLayout && 5}
      >
        <NavLink to="/">
          <img
            role="image"
            aria-label="doocoins"
            src={LogoIcon}
            style={{
              height: "28px",
              marginLeft: showMobileLayout ? 0 : "10px",
              marginTop: "10px",
            }}
          />
        </NavLink>
        <img
          onClick={onOpen}
          role="button"
          ref={btnRef}
          aria-label="open menu"
          src={ProfileIcon}
          style={{
            height: "28px",
            marginRight: showMobileLayout ? "5px" : "15px",
            marginTop: "10px",
          }}
        />
      </Stack>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <Stack style={{ marginTop: "32px" }} spacing={3}>
              <Text
                onClick={onClose}
                fontSize="xl"
                color="#0B334D"
                fontWeight={600}
              >
                <NavLink to="/">My Children</NavLink>
              </Text>
              <Text
                onClick={onClose}
                fontSize="xl"
                color="#0B334D"
                fontWeight={600}
              >
                <NavLink to="https://www.doo.co" target="_blank">
                  About
                </NavLink>
              </Text>
              <Text
                onClick={() => {
                  logout();
                  clearContextState()
                }}
                fontSize="xl"
                color="#0B334D"
                fontWeight={600}
                cursor="pointer"
              >
                Logout
              </Text>
              <Divider />
              <Text
                onClick={onClose}
                fontSize="xl"
                color="#0B334D"
                fontWeight={600}
              >
                If you require support or have any other questions or feedback
                email <a href="mailto:hello.doo.co">hello@doo.co</a>
              </Text>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default NavDrawer;
