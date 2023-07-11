import { get } from "idb-keyval";
import React from "react";
import strings from "../utils/constants";

const useCheckIsUserNewToSwipeActions = ({ handleUpdateCalloutState }) => {
  const [isUserNew, setIsUserNew] = React.useState();
  const checkIsUserNew = async () => {
    const [rewardCallout, rewards] = await Promise.all([
      get(`${strings.CALLOUT_REWARDS_LIST}Callout`),
      get("rewardList"),
    ]);

    if (rewardCallout === undefined || rewardCallout === true) {
      setIsUserNew(true);
      handleUpdateCalloutState(strings.CALLOUT_REWARDS_LIST, true);
    } else {
      setIsUserNew(false);
      handleUpdateCalloutState(strings.CALLOUT_REWARDS_LIST, false);
    }
  };

  React.useEffect(() => {
    checkIsUserNew();
  }, []);

  return { isUserNew };
};

export default useCheckIsUserNewToSwipeActions;
