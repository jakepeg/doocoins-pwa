import { get } from "idb-keyval";
import React from "react";
import strings from "../utils/constants";
import { useAuth } from "../use-auth-client";

const useCheckIsUserNewToSwipeActions = ({ handleUpdateCalloutState }) => {
  const [isUserNew, setIsUserNew] = React.useState();
  const { store } = useAuth();
  const checkIsUserNew = async () => {
    const [rewardCallout, rewards, taskListCallout, tasks] = await Promise.all([
      get(`${strings.CALLOUT_REWARDS_LIST}Callout`, store),
      get("rewardList", store),
      get(`${strings.CALLOUT_TASKS_LIST}Callout`, store),
      get("taskList", store),
    ]);

    if (rewardCallout === undefined || rewardCallout === true) {
      setIsUserNew(true);
      handleUpdateCalloutState(strings.CALLOUT_REWARDS_LIST, true);
    } else {
      setIsUserNew(false);
      handleUpdateCalloutState(strings.CALLOUT_REWARDS_LIST, false);
    }

    if (taskListCallout === undefined || taskListCallout === true) {
      handleUpdateCalloutState(strings.CALLOUT_TASKS_LIST, true);
    } else {
      handleUpdateCalloutState(strings.CALLOUT_TASKS_LIST, false);
    }
  };

  React.useEffect(() => {
    checkIsUserNew();
  }, []);

  return { isUserNew };
};

export default useCheckIsUserNewToSwipeActions;
