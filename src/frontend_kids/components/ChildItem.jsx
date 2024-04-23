import React from "react";
import { Box } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { get, set } from "idb-keyval";
import { ReactComponent as DCIcon } from "../assets/images/dc-white.svg";
import { ChildContext } from "../contexts/ChildContext";

export const swipeContainerStyles = {
  backgroundColor: "#FFF",
  paddingLeft: "1rem",
};

const ChildItem = ({ child }) => {
  const navigate = useNavigate();
  const { setChild } = React.useContext(ChildContext);

  const setChildData = async () => {
    setChild({
      id: child?.id,
      balance: parseInt(child?.balance),
      name: child.name,
    });
  };

  const handleSelectChild = async () => {
    setChildData();
    set("selectedChild", child.id);
    set("selectedChildName", child.name);

    navigate("/wallet");
  };

  return (
    <>
      <Box
        onClick={handleSelectChild}
        display="flex"
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Box textAlign={"left"} fontSize={"22px"} color={"#fff"}>
          {child.name}
        </Box>
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
