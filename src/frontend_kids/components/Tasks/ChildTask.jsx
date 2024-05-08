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
    onToggle(); // trigger animation
    setTimeout(() => {
      setShowEmoji(false);
      onToggle(); // end animation
    }, 2000); // display for 2 second
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
              background="#129FAA"
              ml={4}
              cursor="pointer"
              borderRadius={100}
            >
              <TickIcon
                onClick={() => handleClick(task)}
                width="20px"
                height="20px"
              />
            </Box>
          )}
        </div>
      </Box>
    </>
  );
};

export default ChildTask;
