import React from "react";
import { ReactComponent as DCIcon } from "../../assets/images/dc.svg";
import { ReactComponent as TickIcon } from "../../assets/images/tick.svg";
import { Box, Text } from "@chakra-ui/react";

const ChildTask = ({ task }) => {
  return (
    <>
      <Box
        display="flex"
        justifyContent={"space-between"}
        alignItems={"center"}
        className="list-item"
        role="link"
        as="li"
        px={5}
        key={parseInt(task.id)}
      >
        <Text textAlign={"left"} fontSize={"24px"}>
          {task.name}
        </Text>

        <div className="child-balance">
          <DCIcon className="balance-dc-icon" width="24px" height="24px" />
          <Box fontSize={"24px"}>{parseInt(task.value)}</Box>
          <Box
            p={1}
            background="#129FAA"
            ml={4}
            cursor="pointer"
            borderRadius={100}
          >
            <TickIcon width="20px" height="20px" />
          </Box>
        </div>
      </Box>
    </>
  );
};

export default ChildTask;
