import React from "react";

const WalletIcon = ({ activeColor, width }) => {
  return (
    <svg
      width="30"
      height="30"
      style={{ width }}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1.5"
        y="1.5"
        width="27"
        height="27"
        rx="5.5"
        stroke={activeColor || "white"}
        strokeWidth="3"
      />
      <circle cx="23.5" cy="15.5" r="1.5" fill={activeColor || "white"} />
    </svg>
  );
};

export default WalletIcon;
