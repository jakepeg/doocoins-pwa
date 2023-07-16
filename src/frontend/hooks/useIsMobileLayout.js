import React from "react";
import strings from "../utils/constants";
import { useLocation } from "react-router-dom";

const useIsMobileLayout = () => {
  const { pathname } = useLocation();

  return (
    pathname === strings.TASKS_PATH ||
    pathname === strings.REWARDS_PATH ||
    pathname === strings.WALLET_PATH
  );
};

export default useIsMobileLayout;
