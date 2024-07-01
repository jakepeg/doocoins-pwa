import React from "react";
// import ImageIcon from '../../assets/images/reload_1.png' 
import ImageIcon from '../../assets/images/reload-2.png' 

const ReloadIcon = ({ className, width = "40", height = "40" }) => {
  return (
    <img src={ImageIcon} width={width} height={height} className={className} alt="reload" />
  );
};

export default ReloadIcon;
