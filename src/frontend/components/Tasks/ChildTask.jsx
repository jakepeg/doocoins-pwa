import React from "react";
import { ReactComponent as DCIcon } from "../../assets/images/dc.svg";
import { Box, Text } from "@chakra-ui/react";

const ChildTask = ({ task, handleTaskComplete }) => {
  return (
    <>
      <Box
        display="flex"
        justifyContent={"space-between"}
        alignItems={"center"}
        className="list-item"
        role="link"
        key={parseInt(task.id)}
        onKeyDown={() => handleTaskComplete(parseInt(task.id))}
      >
        <Text textAlign={"left"} fontSize={"22px"}>
          {task.name}
        </Text>
      </Box>

      <div className="child-balance">
        <DCIcon className="balance-dc-icon" width="1.2em" height="1.2em" />
        <Box fontSize={"22px"}>{parseInt(task.value)}</Box>
      </div>
    </>
  );
};

export default ChildTask;
