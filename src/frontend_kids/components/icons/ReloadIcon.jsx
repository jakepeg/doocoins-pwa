import React from "react";
import ImageIcon from '../../assets/images/reload_1.png' 

const ReloadIcon = ({ className, width = "72", height = "72" }) => {
  return (
    <img src={ImageIcon} width={width} height={height} className={className} alt="reload" />
  );
};

export default ReloadIcon;
