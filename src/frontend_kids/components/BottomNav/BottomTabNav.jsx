import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  TabList,
  Tabs,
  useMultiStyleConfig,
  useTab,
} from "@chakra-ui/react";
import React from "react";
import WalletIcon from "./WalletIcon2";
import TasksIcon from "./TasksIcon2";
import RewardsIcon from "./RewardsIcon2";
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
          zIndex={6}
          height={"auto"}
          margin={"0 auto"}
          // backgroundColor={"#0B334D"}
          backgroundColor={"#0B334D"}
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
  const { isNewToSystem, handleUpdateCalloutState } =
    React.useContext(ChildContext);

  const CustomTab = React.forwardRef((props, ref) => {
    // 1. Reuse the `useTab` hook
    const { icon, ...restProps } = props;
    const tabProps = useTab({ ...restProps, ref });
    const isSelected = props.href === pathname;

    // 2. Hook into the Tabs `size`, `variant`, props
    const styles = useMultiStyleConfig("Tabs", tabProps);

    React.useEffect(() => {
      if (isNewToSystem[strings.CALLOUT_NO_TRANSACTIONS] && pathname === "/tasks") {
        handleUpdateCalloutState([strings.CALLOUT_NO_TRANSACTIONS], false);
      }
    }, [isSelected, pathname]);

    return (
      <Link to={props.href}>
        <Button
          style={{ border: "none", paddingTop: '18px' }}
          display="flex"
          flex="0 0 25em"
          flexDirection="column"
          alignItems={"center"}
          justifyContent={"center"}
          __css={styles.tab}
          // {...tabProps}
        >
          <Box as="span" style={{ transform: "translateX(1px)" }}>
            <props.icon activeColor={isSelected && "#00A4D7"} width="40px" height="50px" />
          </Box>
          <Box color={isSelected ? "#00A4D7" : "#fff"} fontSize={14} mt={1}>
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
      <TabList
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "none",
          width: "100%",
          maxWidth: "544px",
          minWidth: "320px",
          margin: "0 auto",
          backgroundColor: "#0B334D",
          paddingBottom: "10px",
        }}
      >
        <CustomTab icon={WalletIcon} href="/">
          {/* Wallet */}
        </CustomTab>
        <CustomTab icon={TasksIcon} href="/tasks">
          {/* Tasks */}
        </CustomTab>
        <CustomTab icon={RewardsIcon} href="/rewards">
          {/* Rewards */}
        </CustomTab>
      </TabList>
    </Tabs>
  );
}
