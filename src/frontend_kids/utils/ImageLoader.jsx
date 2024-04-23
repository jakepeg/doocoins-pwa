import React from 'react';

import GoalIcon from "../assets/images/card-header/cc-claim.svg";
import NoGoalIcon from "../assets/images/card-header/cc-nogoal.svg";
import PlainGoalBackground from "../assets/images/card-header/cc.svg";

const ImageLoader = () => {
  return (
    <div style={{ display: 'none' }}>
      <img src={GoalIcon} alt="Goal Icon" />
      <img src={NoGoalIcon} alt="No Goal Icon" />
      <img src={PlainGoalBackground} alt="Plain Goal Background" />
    </div>
  );
};

export default ImageLoader;
