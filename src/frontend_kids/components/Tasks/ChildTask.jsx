import React, { useState } from "react";
import { ReactComponent as DCIcon } from "../../assets/images/dc.svg";
import { ReactComponent as TickIcon } from "../../assets/images/tick.svg";
import { Box, Text, useDisclosure } from "@chakra-ui/react";
import { ScaleFade } from "@chakra-ui/react";

const ChildTask = ({ task, handleReq }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const { isOpen, onToggle } = useDisclosure();

  const handleClick = (task) => {
    handleReq(task);
    setShowEmoji(true);
    onToggle();
    setTimeout(() => {
      setShowEmoji(false);
      onToggle();
    }, 2000);
  };

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
        position="relative"
      >
        <Text textAlign={"left"} fontSize={"24px"}>
          {task.name}
        </Text>

        <div className="child-balance">
          <DCIcon className="balance-dc-icon" width="24px" height="24px" />
          <Box fontSize={"24px"}>{parseInt(task.value)}</Box>
          {showEmoji ? (
            <ScaleFade initialScale={0.9} in={isOpen}>
              <span
                role="img"
                aria-label="fireworks"
                style={{ marginLeft: "10px", fontSize: "24px" }}
              >
                🎆
              </span>
            </ScaleFade>
          ) : (
            <Box
              p={1}
              background="#00A4D7"
              ml={4}
              cursor="pointer"
              borderRadius={100}
            >
              <TickIcon
                onClick={() => handleClick(task)}
                // width and height should be 22px
                width="0px"
                height="0px"
              />
            </Box>
          )}
        </div>
      </Box>
    </>
  );
};

export default ChildTask;
