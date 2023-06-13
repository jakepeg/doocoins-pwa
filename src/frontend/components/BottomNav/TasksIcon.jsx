import React from "react";

const TasksIcon = ({ activeColor, width }) => {
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
        stroke-width="3"
      />
      <circle cx="8.5" cy="9.5" r="1.5" fill={activeColor || "white"} />
      <circle cx="8.5" cy="15.5" r="1.5" fill={activeColor || "white"} />
      <circle cx="8.5" cy="21.5" r="1.5" fill={activeColor || "white"} />
      <line
        x1="13.5"
        y1="9.5"
        x2="21.5"
        y2="9.5"
        stroke={activeColor || "white"}
        stroke-width="3"
        stroke-linecap="round"
      />
      <line
        x1="13.5"
        y1="15.5"
        x2="21.5"
        y2="15.5"
        stroke={activeColor || "white"}
        stroke-width="3"
        stroke-linecap="round"
      />
      <line
        x1="13.5"
        y1="21.5"
        x2="21.5"
        y2="21.5"
        stroke={activeColor || "white"}
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default TasksIcon;
