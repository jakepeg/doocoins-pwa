import React from "react";

const WalletIcon = ({ activeColor, width = "30px", height = "30px" }) => {
  return (
<svg width={width} height={height} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="1.5" width="27" height="27" rx="5.5" stroke={activeColor || "white"} stroke-width="3"/>
<circle cx="23.5" cy="15.5" r="1.5" fill={activeColor || "white"}/>
<path d="M22 12H28V19H22C20.8954 19 20 18.1046 20 17V14C20 12.8954 20.8954 12 22 12Z" stroke={activeColor || "white"} stroke-width="2"/>
</svg>
  );
};

export default WalletIcon;