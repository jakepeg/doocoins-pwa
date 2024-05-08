import React from "react";
import { ReactComponent as DCIcon } from "../../assets/images/dc.svg";
import { ReactComponent as DotArrow } from "../../assets/images/dotarrow.svg";
import { Box, Text } from "@chakra-ui/react";

const RequestAlert = ({ req }) => {
  return (
    <>
      <Box
        display="flex"
        justifyContent={"space-between"}
        alignItems={"center"}
        className="list-item"
        role="link"
        key={parseInt(req.id)}
      >
        <Text textAlign={"left"} fontSize={"20px"}>
          {req.name}
        </Text>
      </Box>

      <div className="child-balance">
        <DCIcon className="balance-dc-icon" width="18px" height="18px" />
        <Box fontSize={"20px"}>{parseInt(req.value)}</Box>
        <DotArrow height="14px" />
      </div>
    </>
  );
};

export default RequestAlert;
