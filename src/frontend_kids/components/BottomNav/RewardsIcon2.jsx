import React from "react";

const RewardsIcon = ({ activeColor, width = "32px", height = "33px" }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4.99151L18.1616 11.852L18.4921 12.9012H19.5922H26.7133L20.9129 17.2471L20.0622 17.8845L20.3817 18.8983L22.5728 25.8528L16.8994 21.602L16 20.9281L15.1006 21.602L9.42716 25.8528L11.6183 18.8983L11.9378 17.8845L11.0871 17.2471L5.28671 12.9012H12.4078H13.5079L13.8384 11.852L16 4.99151Z" stroke={activeColor || "white"} stroke-width="3"/>
    </svg>
  );
};

export default RewardsIcon;
