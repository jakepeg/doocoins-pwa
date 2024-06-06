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

  console.log(`the reward`, reward);

  return (
    <>
      <Box px={5} as="li" className="list-item" key={parseInt(reward.id)}>
        <Text textAlign={"left"} fontSize={"24px"}>
          {reward.name}
        </Text>
        <div className="child-balance">
          <DCIcon className="balance-dc-icon" width="24px" height="24px" />

    </>
  );
};

export default ChildReward;
