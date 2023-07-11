import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  TabList,
  Tabs,
  useDisclosure,
  useMultiStyleConfig,
  useTab,
} from "@chakra-ui/react";
import React from "react";
import WalletIcon from "./WalletIcon";
import TasksIcon from "./TasksIcon";
import RewardsIcon from "./RewardsIcon";
import strings from "../../utils/constants";
import BottomNavCallout from "../Callouts/BottomNavCallout";
import { ChildContext } from "../../contexts/ChildContext";

function BottomTabNav() {
  const { pathname } = useLocation();

  return (
    <>
      {(pathname === strings.TASKS_PATH ||
        pathname === strings.REWARDS_PATH ||
        pathname === strings.WALLET_PATH) && (
        <Flex
          align="end"
          justify="end"
          boxSize="full"
          position="fixed"
          bottom="0"
          left="50%"
          transform={`translateX(-50%)`}
          justifyContent="space-between"
          zIndex={1}
          height={"auto"}
          margin={"0 auto"}
          // backgroundColor={"#0B334D"}
          backgroundColor={"#ffffff"}
        >
          <CustomTabs />
        </Flex>
      )}
    </>
  );
}

export default BottomTabNav;

function CustomTabs() {
  const { pathname } = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isNewToSystem, handleUpdateCalloutState } = React.useContext(ChildContext);
  console.log(`isNewToSystem`, isNewToSystem)
  React.useEffect(() => {
    console.log('use effect')
    if (isNewToSystem[strings.CALLOUT_NO_TRANSACTIONS] && pathname === strings.REWARDS_PATH) {
      console.log('why not here')
      onOpen();
    }
  }, [isNewToSystem[strings.CALLOUT_NO_TRANSACTIONS], pathname]);

  const CustomTab = React.forwardRef((props, ref) => {
    // 1. Reuse the `useTab` hook
    const { icon, ...restProps } = props;
    const tabProps = useTab({ ...restProps, ref });
    const isSelected = props.href === pathname;

    // 2. Hook into the Tabs `size`, `variant`, props
    const styles = useMultiStyleConfig("Tabs", tabProps);

    React.useEffect(() => {
      if (isOpen && pathname === "/tasks") {
        console.log('not here')
        onClose();
        handleUpdateCalloutState([strings.CALLOUT_NO_TRANSACTIONS], false);
      }
    }, [isOpen, isSelected, pathname]);

    return (
      <Link to={props.href}>
        <Button
          style={{ border: "none" }}
          display="flex"
          flex="0 0 25em"
          flexDirection="column"
          alignItems={"center"}
          justifyContent={"center"}

          __css={styles.tab}
          // {...tabProps}
        >
          <Box as="span" style={{ transform: "translateX(1px)" }}>
            <props.icon activeColor={isSelected && "#139EAA"} width="25px" />
          </Box>
          <Box color={isSelected ? "#139EAA" : "#fff"} fontSize={14} mt={1}>
            {tabProps.children}
          </Box>
        </Button>
      </Link>
    );
  });

  return (
    <Tabs
      sx={{
        width: "100%",
        padding: "0",
        position: "relative",
      }}
    >
      {isOpen && <BottomNavCallout isOpen={isOpen} onClose={onClose} />}

      <TabList
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "none",
          width: "100%",
          maxWidth: "768px",
          minWidth: "320px",
          margin: "0 auto",
          backgroundColor: "#0B334D",
          paddingBottom: "10px",
        }}
      >
        <CustomTab icon={WalletIcon} href="/wallet">
          Wallet
        </CustomTab>
        <CustomTab icon={TasksIcon} href="/tasks">
          Tasks
        </CustomTab>
        <CustomTab icon={RewardsIcon} href="/rewards">
          Rewards
        </CustomTab>
      </TabList>
    </Tabs>
  );
}
