import React from "react";

const ReloadIcon = ({ className }) => {
  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#filter0_d_724_928)">
        <ellipse cx="54.6458" cy="54.5479" rx="30.5" ry="30" fill="#F0F8FC" />
        <path
          d="M84.1458 54.5479C84.1458 70.5486 70.9539 83.5479 54.6458 83.5479C38.3378 83.5479 25.1458 70.5486 25.1458 54.5479C25.1458 38.5471 38.3378 25.5479 54.6458 25.5479C70.9539 25.5479 84.1458 38.5471 84.1458 54.5479Z"
          stroke="#00A4D7"
          stroke-width="2"
        />
      </g>
      <path
        d="M42.136 70.1762C48.2709 75.5653 56.8638 76.3585 63.7091 72.8382C62.677 72.5262 61.688 71.9986 60.8242 71.2398C58.2382 68.9681 57.5273 65.3609 58.807 62.3616C55.9978 64.0172 52.3289 63.7772 49.743 61.5055C46.5242 58.6781 46.2072 53.7791 49.0347 50.5604C51.8621 47.3417 56.7611 47.0247 59.9798 49.8521C62.5658 52.1238 67.4884 51.5279 66.2088 54.5272C69.018 52.8716 67.5666 54.9173 70.1525 57.189C71.0164 57.9478 70.9491 56.4859 71.3867 57.4747C74.005 50.2218 73.7423 46.5693 67.6074 41.1802C59.6019 34.1477 47.4061 34.9369 40.3737 42.9424C33.3413 50.948 34.1305 63.1437 42.136 70.1762Z"
        fill="#00A4D7"
      />
      <path
        d="M71.169 59.1216L54.8735 51.8316L74.9753 41.6803L71.169 59.1216Z"
        fill="#00A4D7"
      />
      <rect
        x="55.3576"
        y="60.5498"
        width="12.9591"
        height="16.9957"
        transform="rotate(25.1082 55.3576 60.5498)"
        fill="#F0F7FC"
      />
      <defs>
        <filter
          id="filter0_d_724_928"
          x="17.1458"
          y="17.5479"
          width="87"
          height="86"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="6" dy="6" />
          <feGaussianBlur stdDeviation="6.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_724_928"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_724_928"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default ReloadIcon;
