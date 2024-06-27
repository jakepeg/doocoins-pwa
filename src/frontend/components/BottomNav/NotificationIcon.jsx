import React from "react";

const NotificationIcon = ({ activeColor }) => {
  return (
    <svg
      width="32"
      height="31"
      viewBox="0 0 32 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.3125 14.7708C4.3125 8.86821 9.09746 4.08325 15 4.08325C20.9025 4.08325 25.6875 8.86821 25.6875 14.7708V23.6944C25.6875 24.5228 25.0159 25.1944 24.1875 25.1944H5.8125C4.98407 25.1944 4.3125 24.5228 4.3125 23.6944V14.7708Z"
        stroke={activeColor ? activeColor : "white"}
        stroke-width="3"
      />
      <ellipse cx="15" cy="2.58333" rx="2.8125" ry="2.58333" fill={activeColor ? activeColor : "white"} />
      <ellipse cx="2.8125" cy="24.1112" rx="2.8125" ry="2.58333" fill={activeColor ? activeColor : "white"} />
      <ellipse
        cx="27.1875"
        cy="24.1112"
        rx="2.8125"
        ry="2.58333"
        fill={activeColor ? activeColor : "white"}
      />
      <path
        d="M11.8125 25.6111H18.1875V27C18.1875 28.3807 17.0682 29.5 15.6875 29.5H14.3125C12.9318 29.5 11.8125 28.3807 11.8125 27V25.6111Z"
        stroke={activeColor ? activeColor : "white"}
        stroke-width="3"
      />
      <circle cx="27" cy="7" r="5" fill="#FF0505" />
    </svg>
  );
};

export default NotificationIcon;
