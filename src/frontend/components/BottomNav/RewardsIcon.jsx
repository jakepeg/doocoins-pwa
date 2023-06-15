import React from "react";

const RewardsIcon = ({ activeColor, width }) => {
  return (
    <svg
      width="32"
      height="29"
      viewBox="0 0 32 29"
      style={{ width }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 4.8541L18.1656 11.5193L18.5024 12.5557H19.5922H26.6004L20.9307 16.675L20.049 17.3156L20.3858 18.3521L22.5514 25.0172L16.8817 20.8979L16 20.2574L15.1183 20.8979L9.44861 25.0172L11.6142 18.3521L11.951 17.3156L11.0693 16.675L5.39962 12.5557H12.4078H13.4976L13.8344 11.5193L16 4.8541Z"
        stroke={activeColor || "white"}
        strokeWidth="3"
      />
    </svg>
  );
};

export default RewardsIcon;
