import { get } from "idb-keyval";
import React from "react";
import strings from "../utils/constants";

const useCheckIsUserNewToTasks = ({ handleUpdateCalloutState }) => {
  const [isUserNewToTasks, setIsUserNewToTasks] = React.useState();
  const checkIsUserNewToTasks = async () => {
    const [childCallout, tasks] = await Promise.all([
      get(`${strings.CALLOUTS_TASKS}Callout`),
      get("taskList"),
    ]);

    if (childCallout !== undefined && tasks !== undefined) {
      setIsUserNewToTasks(false);
      handleUpdateCalloutState(strings.CALLOUTS_TASKS, false);
    } else {
      setIsUserNewToTasks(true);
      handleUpdateCalloutState(strings.CALLOUTS_TASKS, true);
    }
  };

  React.useEffect(() => {
    checkIsUserNewToTasks();
  }, []);

  return { isUserNewToTasks };
};

export default useCheckIsUserNewToTasks;
