import { Box, ScaleFade, useDisclosure, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { ReactComponent as DCIcon } from "../../assets/images/dc.svg";
import { ReactComponent as TickIcon } from "../../assets/images/tick.svg";
import { ReactComponent as CloseIcon } from "../../assets/images/close.svg";
import { ReactComponent as GoalIcon } from "../../assets/images/goal.svg";

const ChildReward = ({
  reward,
  handleReq,
  child,
  handleRemove,
  handleSetGoal,
}) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const { isOpen, onToggle } = useDisclosure();

  const handleClick = (reward, state) => {
    switch (state) {
      case "req":
        handleReq?.(reward);
        break;
      case "close":
        handleRemove?.(reward);
        break;
      case "set":
        handleSetGoal?.(reward);
        break;
    }
    setShowEmoji(true);
    onToggle(); // trigger animation
    setTimeout(() => {
      setShowEmoji(false);
      onToggle(); // end animation
    }, 2000); // display for 2 second
  };

  return (
    <>
      <Box px={5} as="li" className="list-item" key={parseInt(reward.id)}>
        <Text textAlign={"left"} fontSize={"24px"}>
          {reward.name}
        </Text>
        <div className="child-balance">
          <DCIcon className="balance-dc-icon" width="24px" height="24px" />
          <Box fontSize={"24px"}>{parseInt(reward.value)}</Box>
          {showEmoji ? (
            <ScaleFade initialScale={0.9} in={isOpen}>
              <span
                role="img"
                aria-label="fireworks"
                style={{ marginLeft: "4px", fontSize: "24px" }}
              >
                🎆
              </span>
            </ScaleFade>
          ) : (
            <>
              {child.balance >= reward.value ? (
                <Box
                  ml={1}
                  p={1}
                  background="#129FAA"
                  cursor="pointer"
                  borderRadius={100}
                  onClick={() => handleClick(reward, "req")}
                >
                  <TickIcon 
                    // width and height should be 20px
                    width="20px" 
                    height="20px"
                   />
                </Box>
              ) : reward.active ? (
                <Box
                  ml={1}
                  p={1}
                  background="red"
                  cursor="pointer"
                  borderRadius={100}
                  onClick={() => handleClick(reward, "close")}
                >
                  <CloseIcon 
                    stroke="#fff" 
                    // width and height should be 20px
                    width="20px" 
                    height="20px" 
                  />
                </Box>
              ) : (
                <Box
                  ml={1}
                  p={1}
                  cursor="pointer"
                  borderRadius={100}
                  onClick={() => handleClick(reward, "set")}
                >
                  <GoalIcon 
                    fill="#129FAA" 
                    width="24px" 
                    height="24px" />
                </Box>
              )}
            </>
          )}
        </div>
      </Box>
    </>
  );
};

export default ChildReward;
