import {
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Link,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as NavLink } from "react-router-dom";
import React from "react";
import ProfileIcon from "../../assets/images/profile-icon.svg";
import LogoIcon from "../../assets/images/logo.svg";
import { useAuth } from "../../use-auth-client";

function NavDrawer() {
  const { logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  return (
    <>
      <Stack
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
      >
        <NavLink to="/">
          <img
            role="image"
            aria-label="doocoins"
            src={LogoIcon}
            style={{ height: "28px", marginLeft: "15px", marginTop: "10px" }}
          />
        </NavLink>
        <img
          onClick={onOpen}
          role="button"
          ref={btnRef}
          aria-label="open menu"
          src={ProfileIcon}
          style={{ height: "28px", marginRight: "20px", marginTop: "10px" }}
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
                <NavLink to="/about">About</NavLink>
              </Text>
              <Text
                onClick={onClose}
                fontSize="xl"
                color="#0B334D"
                fontWeight={600}
              >
                <NavLink to="/help">Help</NavLink>
              </Text>

              <Divider />
              <Text
                onClick={logout}
                fontSize="xl"
                color="#0B334D"
                fontWeight={600}
              >
                Logout
              </Text>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default NavDrawer;
