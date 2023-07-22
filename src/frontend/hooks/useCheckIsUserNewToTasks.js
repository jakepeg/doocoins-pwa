import { get } from "idb-keyval";
import React from "react";
import strings from "../utils/constants";

const useCheckIsUserNewToTasks = ({ handleUpdateCalloutState }) => {
  const [isUserNewToTasks, setIsUserNewToTasks] = React.useState();
  const checkIsUserNewToTasks = async () => {
    const [taskCallout, tasks, rewardCallout, rewards] = await Promise.all([
      get(`${strings.CALLOUTS_TASKS}Callout`),
      get("taskList"),
      get(`${strings.CALLOUTS_REWARDS}Callout`),
      get("rewardList"),
    ]);

    if (taskCallout !== undefined && tasks !== undefined) {
      setIsUserNewToTasks(false);
      handleUpdateCalloutState(strings.CALLOUTS_TASKS, false);
    } else {
      setIsUserNewToTasks(true);
      handleUpdateCalloutState(strings.CALLOUTS_TASKS, true);
    }

    if (rewardCallout !== undefined && rewardCallout === true) {
      handleUpdateCalloutState(strings.CALLOUTS_REWARDS, false);
    } else {
      handleUpdateCalloutState(strings.CALLOUTS_REWARDS, true);
    }
  };

  React.useEffect(() => {
    checkIsUserNewToTasks();
  }, []);

  return { isUserNewToTasks };
};

export default useCheckIsUserNewToTasks;
