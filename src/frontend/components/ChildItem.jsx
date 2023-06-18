import React from "react";
import { Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { set } from "idb-keyval";
import { ReactComponent as DCIcon } from "../assets/images/dc-white.svg";

export const swipeContainerStyles = {
  backgroundColor: "#FFF",
  paddingLeft: "1rem",
};

const ChildItem = ({ child }) => {
  const handleSelectChild = () => {
    set("selectedChild", child.id);
    set("selectedChildName", child.name);
  };

  return (
    <>
      <Box
        onClick={handleSelectChild}
        display="flex"
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Link to="/wallet">
          <Box textAlign={"left"} fontSize={"22px"} color={"#fff"}>
            {child.name}
          </Box>
        </Link>
      </Box>
      <Link to="/wallet">
        <div className="child-balance">
          <DCIcon className="balance-dc-icon" width="1.2em" height="1.2em" />
          <Box fontSize={"22px"} style={{ color: "#fff" }}>
            {child.balance}
          </Box>
        </div>
      </Link>
    </>
  );
};

export default ChildItem;
