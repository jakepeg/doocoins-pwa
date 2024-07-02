import { Box, ScaleFade, useDisclosure, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { ReactComponent as DCIcon } from "../../assets/images/dc.svg";
import { ReactComponent as TickIcon } from "../../assets/images/tick.svg";
import { ReactComponent as CloseIcon } from "../../assets/images/close.svg";
import { ReactComponent as GoalIcon } from "../../assets/images/goal.svg";
import { ReactComponent as SmileyIcon } from "../../assets/images/smiley.svg";

const ChildReward = ({
  reward,
  handleReq,
  child,
  handleRemove,
  handleSetGoal,
}) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    setIsOpen(true); // trigger animation
    setTimeout(() => {
      setShowEmoji(false);
      setIsOpen(false); // end animation
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
            <Box
                p={1}
                background="#FBB03B"
                ml={4}
                cursor="pointer"
                borderRadius={100}
              >
            <SmileyIcon 
                    width="18px"
                    height="18px"
                   />
                   </Box>
            </ScaleFade>
          ) : (
            <>
              {child.balance >= reward.value ? (
                <Box
                  ml={4}
                  p={1}
                  background="#129FAA"
                  cursor="pointer"
                  borderRadius={100}
                  onClick={() => handleClick(reward, "req")}
                >




                  <TickIcon 
                    // width and height should be 20px
                    width="18px"
                    height="18px"
                   />
                </Box>
              ) : reward.active ? (
                <Box
                  ml={4}
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
                  ml={4}
                  p={0}
                  cursor="pointer"
                  borderRadius={100}
                  onClick={() => handleClick(reward, "set")}
                >
                  <GoalIcon 
                    fill="#129FAA" 
                    width="26px" 
                    height="26px" />
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
